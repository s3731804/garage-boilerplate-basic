# Huy — Sprint 1 follow-up and handoff

Verification date: 9 September 2026. These are new follow-up results, not evidence
that the work had already been finished at an earlier submission date.

## Scope and design

Add a synthetic SSR route to the existing Next.js frontend and a reproducible
network-disabled scanner container. Do not change the real supplier database or
claim that source review/client approval is complete. Preserve the existing
extension scaffold from PR #8.

## SSR alternatives assessed

This is an engineering assessment of the current repository, not a hosting quote.

| Criterion | Next.js server rendering | Express with server HTML templates |
| --- | --- | --- |
| SEO and previews | Can return content and metadata in HTML; metadata API handles tags | Can return equivalent HTML; title, descriptions and escaping need explicit template handling |
| Build effort | Lower here because this repository already uses Next.js; the spike builds with the existing app | Lower if the target application is already Express; adding another renderer to this repository increases integration effort |
| Runtime cost | Requires a compatible server/serverless runtime; measure traffic and provider costs before budgeting | Requires a Node server; potential simpler rendering does not establish a cheaper deployment without measurement |
| Compatibility | Matches this repository's React/Next frontend | May better match a separate Express application, but that source/deployment was not available for integration verification |
| Risks | Cache/publication rules and server/client data boundary require design | Manual metadata, error handling and data boundary require design |

Recommendation: use Next.js for this repository's SSR spike. Confirm the actual
production host and API contract with Team A before adopting it for the live
Trust Page. This does not replace PR #7's proposal or constitute Team A approval.
Client decision D7 is still awaiting explicit confirmation.

## SSR reproduction and observed results

```sh
pnpm --filter frontend build
pnpm --filter frontend start --port 3100
# In a second terminal:
node scripts/check-ssr-spike.mjs
```

Production build passed; Next reported `/s/[slug]` as dynamic/server-rendered.
The smoke test passed all of these checks:

- Public HTTP 200 HTML without authentication.
- Visible heading/content after removing all script blocks (not just an RSC payload).
- Title, description and Open Graph metadata; synthetic demo marked noindex.
- Different render timestamps on successive requests:
  `2026-09-09T09:39:49.919Z` and `2026-09-09T09:39:50.156Z`.
- Synthetic UUID alias and crawler user agent response.
- Unknown, reserved and malformed identifiers return HTTP 404.

Demo: `/s/demo-supplier`. The UUID alias is a test fixture, not a final identifier
contract. No live supplier data, publication controls, exports or API integration
are implemented here. The existing Render endpoint was not modified or deployed
by this follow-up. CI now repeats the production HTML smoke test.

## Scanner reproduction and observed results

```sh
pnpm --filter @team34/scanner-sandbox test
pnpm --filter @team34/scanner-sandbox build
docker compose -f scanner-sandbox/compose.yaml run --build --rm scanner-proof
```

Four unit tests passed. The actual Docker container proof passed using Node
v22.23.2, UID 1000: no capabilities, no privilege escalation, no network interface
except loopback, read-only root, no application credentials, dry-run enabled,
empty default allowlist and enforced page budget. The test container exits and
is removed after the proof; no live scanning takes place.

The crawler rules and cost model remain in `docs/scanner/`. Unit prices and real
usage are not yet measured. These documents are preparation, not a production
crawler or a provider bill estimate.

## Acceptance status — do not mark all items complete

| Item | Evidence/status |
| --- | --- |
| Two SSR approaches assessed | Comparison above |
| SSR HTML with title/meta | Local production build + automated HTTP test passed |
| SSR recommendation agreed with Team A | Awaiting confirmation |
| Client D7 resolved | Awaiting confirmation |
| Isolated scanner environment provisioned | Ephemeral local Docker runtime proof passed; reproducible in CI |
| Crawl rules and rate limits documented | Existing crawl rules plus tested budget; live robots adapter not implemented |
| Existing prospectScanner.js reviewed | Blocked: original source unavailable; integration notes are proposals only |
| Cost model noted | Formula/scenarios documented; rates and operating ceiling still TBD |

## Handoff

PR: https://github.com/s3731804/garage-boilerplate-basic/pull/9

Remote verification run:
https://github.com/s3731804/garage-boilerplate-basic/actions/runs/34336236330

Initial 9 September result: frontend production SSR checks, backend tests and
extension/scanner container checks passed in GitHub Actions. **Security Scan failed**. A local
`pnpm audit --audit-level=high` reproduced 8 dependency findings (2 critical,
2 high, 4 moderate), including Next.js, sharp and js-yaml. The existing dependency
versions/lockfile were unchanged at that point. This historical failure is
superseded by the 10 September remediation below. No audit exclusions or
bypasses were added.

### Security remediation — 10 September 2026

- Next.js and eslint-config-next: 16.3.3 (same major, patched runtime).
- sharp >=0.35.4, js-yaml >=4.3.2 and qs >=6.16.0 via workspace overrides.
- Vitest and coverage-v8: 4.1.11 across workspaces. Backend tests use the new
  top-level worker settings, run sequentially and retain per-file isolation.
- pnpm 10.34.5 pinned for local/CI consistency; lockfile regenerated with pnpm 10.

The reproducible failure was `pnpm audit`: vulnerable resolved versions, not a
failure in the SSR/container implementation. After patching, `pnpm audit
--audit-level=low` returned **No known vulnerabilities found**. This checks the
dependency advisory database, not all possible application security flaws.

Local regression results on Node 22.23.2:

- All 18 tests passed (backend 5, frontend 8, extension 1, scanner 4).
- All four workspace builds and typechecks passed; lint passed with one
  pre-existing unused-import warning in the Team page.
- Production SSR HTTP smoke passed on Next.js 16.3.3. Request timestamps:
  `2026-09-10T07:07:30.192Z`, `2026-09-10T07:07:30.430Z`.
- Docker isolation proof passed again (UID 1000, no network, read-only root,
  no capabilities/privilege escalation, safe defaults and page limit).

See PR #9's latest Checks for the current remote verdict before merging.
This remediation does not close the original-source review or client sign-off.

Sources: [Next.js advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36),
[Vitest advisory](https://github.com/advisories/GHSA-82fw-gwwq-j7x9),
[Vitest migration guide](https://vitest.dev/guide/migration/).

Reviewer: please run the commands above and review the synthetic route and
container restrictions. Team A must supply `prospectScanner.js` with a source
commit and confirm the intended production runtime/API contract. Once available,
map actual functions to reuse/wrap/replace and add contract tests. PM/client must
record the D7 decision. Update Planner with these evidence links and actual dates;
do not check off the unavailable-source review or external approvals.

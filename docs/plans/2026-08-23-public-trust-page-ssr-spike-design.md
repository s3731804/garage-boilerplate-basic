# Public Trust Page SSR Spike

**Team:** Team 34 - Team B

**Owner:** Hoang Ha Quoc Huy

**Board card:** SSR spike for the public trust page

**Date:** 23 August 2026

**Status:** Complete - recommendation ready for review

## 1. Decision summary

Build the public Trust Page as a Next.js App Router dynamic route at
`frontend/src/app/s/[slug]/page.tsx`. Keep the page a Server Component and fetch
one public, server-filtered profile by slug. Client Components should be limited
to interactions such as expanding long text or starting a download.

Team A owns the database schema, migrations, and public read API. Team B owns
the Trust Page presentation and should provide Team A with the required fields
and response contract. Team B must not query raw compliance tables from the
browser or duplicate Team A's backend.

This approach is feasible in the repository's current stack (Next.js 16.2.12,
React 19, App Router). No blocking framework issue was found.

## 2. Spike question and success criteria

### Question

Can `/s/:slug` render public compliance information on the server with correct
SEO, bounded staleness, and no private data reaching the client?

### Success criteria

- A dynamic `/s/[slug]` route can render without authentication.
- Page content, title, description, Open Graph data, and JSON-LD originate on
  the server.
- The browser receives only confirmed, public content.
- Certificate status and `last_updated` are computed by the backend.
- Disabled and unknown pages do not reveal whether a supplier exists.
- Old slugs redirect permanently to the current slug.
- Cached certificate state is no more than 24 hours old.
- View logging does not depend on whether a page render was served from cache.

## 3. Scope boundary

### In scope for this spike

- Dynamic route and rendering model.
- Minimum public API response contract.
- Metadata and structured data.
- Cache and invalidation strategy.
- Redirect, unpublished, not-found, and upstream-error behaviour.
- Security, privacy, observability, and test recommendations.

### Out of scope

- Database migrations and row-level security implementation.
- Supplier profile builder and answer engine.
- Questionnaire autofill and browser extension.
- Production UI and export implementation.
- Request-access workflow for `on_request` data.

## 4. Repository findings

- The frontend uses Next.js 16.2.12 with the App Router.
- App Router pages are Server Components by default.
- Dynamic route parameters are asynchronous in this Next.js version:
  `params: Promise<{ slug: string }>`.
- The current `next.config.ts` does not enable Cache Components. Caching must be
  explicit under the current configuration.
- `generateMetadata` is server-only and can use the same memoized fetch as the
  page render.
- `notFound()` produces a 404 response and adds `noindex` metadata.
- Next.js `permanentRedirect()` returns HTTP 308, not HTTP 301. The requirement
  for an exact 301 therefore needs a decision; see Section 8.

## 5. Proposed architecture

```text
Distributor browser
        |
        | GET /s/acme-supplies
        v
Next.js Server Component: app/s/[slug]/page.tsx
        |
        | server-to-server request by validated slug
        v
Team A public profile endpoint
        |
        | filters status + visibility and derives status/last_updated
        v
PublicTrustProfile DTO
        |
        +--> generateMetadata / Open Graph / JSON-LD
        +--> server-rendered page HTML
        +--> small Client Components for expand/download actions
```

The public endpoint is the security boundary. Filtering data only in React is
not acceptable because hidden fields may still appear in the RSC payload, page
source, logs, or exports.

## 6. Minimum public API contract

Team A should expose one endpoint equivalent to:

```http
GET /public/compliance-pages/:slug
```

The response should use a discriminated result so the page does not infer
security-sensitive state from incomplete data:

```ts
type PublicTrustPageResult =
  | { state: 'published'; profile: PublicTrustProfile }
  | { state: 'redirect'; canonicalSlug: string }
  | { state: 'unavailable' }
```

`PublicTrustProfile` needs:

- Supplier name, optional ABN, country, logo URL, and intro.
- Canonical slug and server-computed `lastUpdated`.
- Certification cards with issuer, number, scope, date range, public document
  link, and server-derived `verified | self_declared | expired` status.
- Categories containing only confirmed, public answers.
- Canonical question, formatted answer, confirmed date, and public provenance.
- Export links or identifiers for public-only PDF and structured exports.

The endpoint must never serialize private, `on_request`, draft, or stale data.
Empty categories should be removed by the server or omitted by the page.

## 7. Rendering and metadata

The page should remain a Server Component. Both the page and
`generateMetadata` should call the same server data function. Identical `fetch`
requests are memoized during one render pass, avoiding duplicate upstream work.

The initial HTML should contain:

- Supplier-specific title and description.
- Canonical URL.
- Open Graph title, description, URL, and safe logo where available.
- JSON-LD `Organization` containing only public company fields.
- Visible last-updated date and certificate status text, not colour alone.

Only interactive islands should use `'use client'`, for example the four-line
expand control. Content required by search engines or the 30-second scan must
not wait for a browser-side fetch.

## 8. Route outcomes

| API state | Recommended page behaviour |
|---|---|
| `published` | Render HTTP 200 with server-generated metadata and content. |
| `redirect` | Permanently redirect to `/s/{canonicalSlug}`. |
| `unavailable` | Render the same neutral 404 page for disabled and unknown suppliers. |
| upstream timeout/error | Render a generic temporary error boundary and log a correlation ID; do not present it as unpublished. |
| invalid slug syntax | Reject before the API call and use the neutral 404 page. |

### Open decision: 301 versus 308

The requirements specify a 301 for previous slugs, while Next.js
`permanentRedirect()` emits a 308. Both are permanent and preserve SEO signals,
but they differ in method-preservation semantics. If the client requires an
exact 301, implement the redirect in a Route Handler, proxy, or hosting layer
that can return `Response.redirect(url, 301)`. Otherwise document acceptance of
308 and use `permanentRedirect()` in the page.

## 9. Cache and freshness

The certificate-expiry rule permits a maximum cache TTL of 24 hours. Start with
a conservative one-hour revalidation interval, then tune using production load:

- Cache by canonical slug.
- Revalidate within 3,600 seconds initially and never exceed 86,400 seconds.
- Invalidate the slug when public answers, certificates, visibility, or page
  publishing state changes.
- Invalidate both old and new slug keys after a slug change.
- Derive expiry and `last_updated` before caching the public response.

The deployment platform must be tested because the current repository does not
enable Next.js Cache Components, and in-memory caches may not be durable across
serverless instances. API/CDN cache headers or a shared remote cache may be a
better ownership boundary for Team A's endpoint.

## 10. View logging and privacy

Do not treat Server Component execution as one page view. Cached responses may
skip rendering, while revalidation, prefetching, crawlers, and metadata requests
may execute code without a human view.

Log views at a request-aware layer agreed with Team A, using a bot-filtered
event contract. Record only the fields approved by the client. Viewer IP and
work email are personal information; retention and privacy-policy ownership are
blocking client decisions before production launch. The UI work can proceed,
but analytics must not be declared production-ready until those decisions are
recorded.

## 11. Security and accessibility checks

- Validate slugs against lowercase alphanumeric and hyphen rules before lookup.
- Use a single neutral response for disabled and unknown suppliers.
- Escape all supplier-authored text; do not render arbitrary HTML.
- Allow only approved HTTPS domains for logos and public documents.
- Set public export responses to contain the same filtered dataset as the page.
- Ensure status is communicated with text, not colour alone.
- Preserve keyboard access and visible focus for expand/download controls.
- Test heading hierarchy, 200% zoom, narrow mobile layout, and WCAG 2.1 AA
  contrast.

## 12. Recommended test plan for Sprint 2

### Unit tests

- Slug validation and reserved words.
- API result-to-route outcome mapping.
- Certificate status formatting without recomputing expiry in the browser.
- Public-answer/category filtering contract checks.
- JSON-LD serialization excludes optional missing fields.

### Integration tests

- Published page returns server-rendered supplier content and metadata.
- Unknown and disabled slugs return identical status and visible copy.
- Previous slug redirects to the canonical URL with the agreed status code.
- Draft, stale, private, and `on_request` values are absent from HTML, RSC
  payloads, JSON-LD, and exports.
- API failures render a temporary error rather than the unpublished state.

### Non-functional tests

- Verify cache freshness across a certificate expiry boundary.
- Confirm bots and framework prefetches do not inflate view counts.
- Run the 30-second scan test with someone outside the team.
- Check mobile layout, keyboard navigation, screen-reader labels, and contrast.

## 13. Risks and decisions needed

| Risk or decision | Owner | Impact |
|---|---|---|
| Exact 301 versus Next.js-native 308 | PM/client + Team A | Redirect implementation location |
| Public API and schema not frozen in week 1 | Team A | Blocks Sprint 2 integration |
| IP/email retention and privacy-policy wording unresolved | Client/legal | Blocks production analytics launch |
| Durable cache/invalidation ownership unclear | Team A + Team B | Stale certificate status or uneven performance |
| Logo/document host allowlist unknown | Team A + Team B | Security and broken media risk |

## 14. Recommendation and handoff

Proceed in Sprint 2 after Team A freezes the fields and public endpoint contract.
Team B should first implement the route against a typed fixture, then connect the
same data function to Team A's endpoint. Keep all filtering and derived trust
state server-side. Resolve the exact permanent redirect code and analytics
privacy decisions before calling the feature production-ready.

### Planner completion comment

> Completed the Public Trust Page SSR spike for `/s/:slug`. Confirmed the route
> is feasible with the current Next.js 16 App Router stack and documented the
> server-rendering architecture, Team A API boundary, metadata/JSON-LD, cache
> strategy, route outcomes, privacy risks, and Sprint 2 test plan. Flagged two
> decisions for review: the requirement asks for HTTP 301 while Next.js
> `permanentRedirect()` emits 308, and view logging must sit outside cached page
> rendering. Deliverable: `docs/plans/2026-08-23-public-trust-page-ssr-spike-design.md`.

## 15. Sources reviewed

- `trustpage-requirements.md`, 22 August 2026.
- `frontend/package.json` (Next.js 16.2.12).
- `frontend/next.config.ts`.
- Bundled Next.js 16.2.12 documentation:
  - App Router dynamic route segments.
  - Server and Client Components.
  - `generateMetadata`.
  - Caching and `cacheLife`.
  - `notFound()` and `permanentRedirect()`.

# `prospectScanner.js` integration points

## Source status

The current Team B repository does not contain `prospectScanner.js`. The Team A
boilerplate repository (`Txmmsy/BoilerPlateCode`) was also inspected on 6 September
2026 and does not contain that file. Therefore this document defines the contract
for review; it does not claim that unavailable code has been reused.

## Reuse when the source is supplied

- Reuse pure parsing and field-normalisation functions when they accept HTML or a
  document value and have no hidden network, database, or environment dependency.
- Reuse schema mappings only after Team A freezes the shared field names and types.
- Wrap existing logging behind an injected logger so secrets and full page bodies
  cannot be emitted.

## New Team B adapters

- `targetPolicy`: call `evaluateCrawlTarget` before the first request and after
  every redirect.
- `robotsPolicy`: resolve the site's robots rules for the declared user agent and
  fail closed when no safe decision can be made.
- `crawlBudget`: call `CrawlBudget.tryConsume` immediately before each request.
- `transport`: injected HTTP client with one in-flight request per host, bounded
  response size and no cookie/session persistence.
- `resultSink`: maps only approved Team B fields into the shared schema.
- `telemetry`: counts pages, bytes, duration and policy blocks without storing page
  content or personal information.

Once Team A supplies `prospectScanner.js`, record its commit SHA, map each exported
function to **reuse**, **wrap**, or **replace**, and add contract tests before
connecting any live network adapter.

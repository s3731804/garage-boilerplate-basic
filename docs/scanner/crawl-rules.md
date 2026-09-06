# Scanner crawl rules

These rules apply before the scanner is allowed to leave dry-run mode.

## Target and robots controls

1. Crawl HTTPS pages only and use an explicit hostname allowlist. Do not crawl
   localhost, IP literals, authenticated areas, or URLs containing credentials.
2. Fetch and evaluate `/robots.txt` for the scanner's declared user agent before
   the first page on each host. A disallow rule, unavailable policy decision, or
   fetch failure is fail-closed and blocks the crawl.
3. Re-check the target policy and robots decision after every redirect. Never use
   form submission, login, CAPTCHA bypass, or robots circumvention.
4. Retain only fields approved in the Team B schema. Do not retain page bodies,
   secrets, personal data, cookies, or credentials in logs.

## Rate and run limits

- Default minimum delay: 2,000 ms between requests per run.
- Default page budget: 25 pages per run.
- Honour a longer `Crawl-delay` when one is supplied by the site.
- Use at most one in-flight request per host. For HTTP 429 or 503, stop the host
  run; a future implementation may retry only with bounded exponential backoff.
- Every run must support a kill switch, record allow/deny decisions, and start in
  dry-run mode.

`CrawlBudget` supplies the local page and delay guard. The future transport layer
is responsible for robots parsing, per-host concurrency and response handling.

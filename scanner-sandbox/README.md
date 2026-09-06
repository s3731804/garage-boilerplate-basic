# Scanner sandbox

This package is a safe, isolated foundation for prospect scanning. It does not
import the Trust Page application, Firebase configuration, or shared production
credentials. Configuration is accepted only through `SCANNER_*` variables and
dry-run mode is on by default.

No production crawler is included. Before a network adapter is connected, it must
check `evaluateCrawlTarget`, honour the site's robots policy, and acquire a page
from `CrawlBudget` for every request and redirect.

See the project documentation:

- `docs/scanner/crawl-rules.md`
- `docs/scanner/prospect-scanner-extension-points.md`
- `docs/scanner/cost-model.md`

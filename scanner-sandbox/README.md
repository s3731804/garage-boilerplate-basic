# Scanner sandbox

This package is a safe, isolated foundation for prospect scanning. It does not
import the Trust Page application, Firebase configuration, or shared production
credentials. Configuration is accepted only through `SCANNER_*` variables and
dry-run mode is on by default.

No production crawler is included. Before a network adapter is connected, it must
check `evaluateCrawlTarget`, honour the site's robots policy, and acquire a page
from `CrawlBudget` for every request and redirect.

## Reproduce the isolation proof

From the repository root, with Docker running:

```sh
pnpm --filter @team34/scanner-sandbox build
docker compose -f scanner-sandbox/compose.yaml run --build --rm scanner-proof
```

The ephemeral container has no network, host mounts or application credentials.
It runs as UID 1000 with a read-only root, all capabilities dropped and privilege
escalation disabled. Compose also limits memory to 128 MiB, CPU to 0.5 and PIDs to
64. The proof script checks runtime isolation and safe scanner defaults. This is
a provisioned local/CI sandbox, not a persistent deployed scanning service.

Localhost, local hostnames and IP literals are rejected even if allowlisted.
This is not a complete SSRF defence for future network code: that adapter must
also validate resolved IP addresses and redirects against private/reserved
networks, and implement robots.txt handling before crawling is enabled.

See the project documentation:

- `docs/scanner/crawl-rules.md`
- `docs/scanner/prospect-scanner-extension-points.md`
- `docs/scanner/cost-model.md`

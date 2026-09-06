# Scanner cost model

This model separates measurable usage from provider pricing so estimates can be
updated without changing scanner code.

## Per-run calculation

`run cost = request cost + compute cost + egress cost + optional analysis cost`

- Requests = pages attempted, including redirects and robots requests.
- Compute = run duration in seconds × provider compute rate.
- Egress = response bytes retained in memory × provider egress rate.
- Optional analysis = input/output units × the selected analysis provider rate.

## Planning scenarios

| Scenario | Pages/run | Runs/day | Max page fetches/day |
| -------- | --------: | -------: | -------------------: |
| Low      |        10 |        4 |                   40 |
| Base     |        25 |       12 |                  300 |
| High     |       100 |       24 |                2,400 |

The default sandbox is capped at 25 pages per run. Provider unit prices, average
response bytes and analysis units remain `TBD` until hosting and analysis services
are selected. The owner must fill those inputs and approve a daily cost ceiling
before live scanning is enabled. Policy-blocked and dry-run targets have zero
network cost.

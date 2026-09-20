# S2-3: Header and certification cards

## Scope and decisions

Implement S2-3 independently on the existing Team B repository. The available
main branch contains Sprint 1's SSR spike, not William's Sprint 2 route/data layer.
Do not replace that spike or claim live integration. No database credentials are needed.

Use two presentational components: `SupplierHeader` and `CertificationCards`.
They accept only an already-public display model. William's S2-2 adapter must
apply visibility, confirmed/public filtering, expiry precedence and last-updated
calculation before passing props. The local types are not a frozen Team A schema.

The user approved tests at the rendered-HTML boundary covering the seven Planner
criteria. Test observable headings, fields, status text, omission, empty state,
expired-date treatment and the absence of download links. No internal mocks.

## Visual direction

Restrained green/neutral supplier identity, readable metadata and bordered cards.
CSS is scoped. Cards stack on small screens and long reference numbers wrap.
The named Figma frames were not supplied, so this is provisional styling for
Callum to review, not a claim of pixel-perfect frame compliance.

## Preview and integration boundary

`/preview/s2-3` uses visibly marked synthetic fixtures and noindex metadata.
Four scenarios: full, thin, empty and long. Only this exact preview path bypasses
the root Firebase client provider so local QA needs no secrets. Existing route
protection and the real supplier route are unchanged.

No download URL is part of the component contract while G-3 is unresolved.
Missing/blank optional values and invalid dates omit the corresponding label.
Status is supplied by the server, never derived from the browser clock.

## Remaining acceptance

William's current repository/branch and public payload must be provided for
integration. Callum must compare the implementation with Desktop main – Sprint 2
and Greenleaf (thin). Do not mark the entire story accepted until those checks pass.

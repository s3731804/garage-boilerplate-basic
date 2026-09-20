# S2-3 handoff — Hoang Ha Quoc Huy

## Status

Implemented and locally verified as isolated components and a synthetic QA
preview. **Not yet integrated into William's Sprint 2 Public Trust Page, deployed,
or accepted by design QA.** Do not mark the whole Planner story Completed yet.

## What is included

- Supplier logo, name, ABN, country, introduction and last-updated date.
- A card for each certification: name, issuer, certificate number and validity.
- Optional blank/null fields omitted, including their labels; invalid dates omitted.
- Verified / Self-declared / Expired text chips, not colour-only indicators.
- Expired date highlighted and labelled "Expired on".
- Explicit "No certifications published" empty state.
- No certificate download link or URL prop while G-3 is unresolved.

Components: `frontend/src/features/trust-page/SupplierHeader.tsx` and
`CertificationCards.tsx`. Public display types are in `types.ts` beside them.

## Run locally

From the repository's `frontend` directory (dependencies already installed):

```powershell
node scripts/run-next.cjs build
node scripts/run-next.cjs start --hostname 127.0.0.1 --port 3103
```

Open `http://127.0.0.1:3103/preview/s2-3`. This is a local URL, not a link Callum
can open remotely. Share the branch or an approved staging deployment for remote QA.
The four scenario links exercise full data, missing fields, empty certifications
and long supplier/certificate content. All data is fictional and marked as such.
The existing Team34 banner belongs to the boilerplate, not the S2-3 component.

## Verification, 20 September 2026

- Production build including TypeScript: passed.
- ESLint on added components, preview and modified provider: passed.
- Frontend Vitest: 16 tests passed across 4 files (8 new S2-3 tests).
- `node scripts/check-s2-3.mjs`: all four preview scenarios return server-rendered
  HTML; no download links; `/dashboard` still redirects unauthenticated viewers.
- Browser checked full, thin, empty and long scenarios. At a 390px viewport,
  full and long scenarios had equal document and scroll widths (no horizontal overflow).
- Only `/preview/s2-3` bypasses Firebase's client provider. No credentials were
  read or added, and no auth protection was removed from private routes.

## Integration instructions for William

Render the two components inside the real public server-rendered route after
S2-1/S2-2 has approved access and assembled the public payload:

```tsx
<SupplierHeader supplier={publicSupplierHeader} />
<CertificationCards certifications={publicCertifications} />
```

Map the published payload to the display types; do not pass raw private/draft
database records or certificate download URLs. S2-2 owns status precedence,
expiry calculation and last-updated computation. Dates should be ISO calendar
dates or ISO timestamps with a timezone; display is formatted in UTC/en-AU.
Logo URLs must come from the approved public asset source. A missing logo is
omitted. Resolving inaccessible/broken remote assets belongs to that source.

## Callum's QA / remaining dependencies

Compare spacing, fonts, colour and content order with **Desktop main – Sprint 2**
and **Greenleaf (thin)**; those source frames were not available for this work.
Check the two components with William's actual public payload and real route.
Confirm all three statuses, thin/empty states, expiry styling and G-3 download
restriction before acceptance. This delivery does not implement S2-4, S2-8,
S2-10 or S2-12.

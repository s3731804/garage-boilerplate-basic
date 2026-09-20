# S2-3 handoff — Hoang Ha Quoc Huy

## Status

Implemented and locally verified as isolated components and a synthetic QA
preview. **Not yet integrated into William's Sprint 2 Public Trust Page, deployed,
or accepted by design QA.** Do not mark the whole Planner story Completed yet.

## What is included

- Supplier logo (an initials tile when there is no logo, as in the design), name, ABN,
  country, introduction and last-updated date.
- A card for each certification: name, issuer, certificate number and validity.
- Optional blank/null fields omitted, including their labels; invalid dates omitted.
- Verified / Self-declared / Expired text chips, not colour-only indicators.
- Expired certificates: the chip reads Expired and the end date is shown in the chip's
  red, with a screen-reader-only "(expired)" after it. The validity line follows the
  design: "Valid: from - to", or "Valid from:" / "Valid to:" when only one end exists.
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

`/preview/*` is not served on the production deployment: `app/preview/layout.tsx`
returns 404 when `VERCEL_ENV=production`. Local builds and Vercel Preview
deployments still serve it, so a preview deployment of this branch is the way to
give Callum a remote link.

## Design alignment, 20 September 2026

The first version was styled without the Figma file (green theme, serif heading) and
did not match the mock-ups. It was restyled from the HighFidelity file, frame
"Profile 1 - Four Certifications - Desktop", read in Dev Mode:

- Geist / Geist Mono, text `#0F172A` / `#475569`, accent `#4F46E5`.
- Header: `#EEF2FF`, 12px radius, 32px padding, 64px logo tile, name 28px / 800.
- Card: 8px radius, 1px `#E2E8F0` border, 20px padding, 12px gap, chips in Geist Mono
  10px uppercase (Verified `#D1FAE5`/`#047857`, Self-declared `#DBEAFE`/`#1D4ED8`,
  Expired `#FEE2E2`/`#B91C1C`), three columns at 1280px with 16px gaps.

Values marked "approx." in `trust-page.module.css` were estimated from the frame, not
read from the inspect panel (logo-to-title gap, label grey, section gap, badge size,
mobile spacing). The chip colours for Self-declared and Expired were read from a
low-resolution panel; confirm them in design QA.

### Where the design and the requirements disagree — needs a decision

The build follows the requirements for behaviour and the design for looks. These are
the places they differ:

1. **Missing issuer.** The self-declared card in the design reads "Issuer: Not
   provided". The backlog (C-2) and the Planner checklist say to omit the line. Built:
   omitted. Switching is a one-line change in `CertificationCards.tsx`.
2. **Expired date.** The design shows "Valid to: 30 Jun 2024" in the normal text
   colour; the checklist asks for an "expired treatment" on the date. Built: the date
   in red plus the screen-reader cue. Confirm with Callum and Morgan.
3. **In the design, not in the S2-3 bullets, so not built:** the "n of N certifications
   verified by Zilch" summary line, the Copy link button, the description with "Show
   more", and the download link (hidden until G-3, as required).

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

Compare spacing, fonts, colour and content order with the HighFidelity frames
"Profile 1 - Four Certifications - Desktop / Mobile" and "Profile - Thin - Two
Certifications". The desktop frame was read in Dev Mode; the mobile frame was only
checked by eye, and the empty state ("06 - Error & empty") was not compared.
Check the two components with William's actual public payload and real route.
Confirm all three statuses, thin/empty states, expiry styling and G-3 download
restriction before acceptance. This delivery does not implement S2-4, S2-8,
S2-10 or S2-12.

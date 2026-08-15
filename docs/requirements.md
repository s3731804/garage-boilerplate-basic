# Requirements - Team Page Content & Login Restyling

**Project:** enterprise supply chain data portal Team B · Team 34
**Board task:** [Login Restyling Bootstrap] Task 1 - Write Requirements: Team Page & Login Styling
**Author:** Morgan Xiao - BA
**Reviewers:** PM - Antony Rajan · UX - Callum Timms
**Date:** 14/08/2026
**Repo location:** `garage-boilerplate-basic/docs/requirements/.md`
**Related artifacts:** [BOOTSTRAP RESTYLING] Design Login Style & Team Page Layout

---

## 1. Purpose

Define (a) the content fields and display rules for the new Team page, and (b) the boundary of the login work, so that the login restyle is delivered as a visual change only, with no modification to authentication logic or session behaviour.

---

## 2. Scope

### 2.1 In scope

| # | Item |
|---|------|
| S-1 | New Team page: content model, field-level validation, display rules |
| S-2 | Team page responsive layout behaviour (card grid) |
| S-3 | Login page visual restyle (e.g. layout, typography, colour, spacing, component styling) |
| S-4 | Documented edge cases for both pages |

## 3. Login - scope is styling only

> **Note:** The login work is a **presentation-layer change only**. No authentication logic, credential validation, session handling, or routing behaviour is to be created, removed, or modified.

---

## 4. Team page - content fields

### 4.1 Page-level fields

| Field | Required | Rule |
|-------|----------|------|
| Page heading | Yes | Renders as "Meet Team 34". Static copy. |
| Team name | Yes | "Team 34". Appears in the heading and the logo lockup. |
| Project name | enterprise supply chain data portal Team B | Named in the Task 1 completion comment but absent from the mockup. If required, display as a subheading beneath the page heading. |
| Logo | Yes | Team 34 logo, top-left, links to home. |

### 4.2 Per-member fields

Five member records are expected. Each record has four content fields: **photo, name, role, blurb.**

| ID | Field | Required | Type / limits | Validation rule | Display rule |
|----|-------|----------|---------------|-----------------|--------------|
| 1 | Member name | Yes | Text, 1–40 chars | Non-empty after trim; letters, spaces, hyphens, apostrophes | Card title, top-left, bold. Wraps to a second line; does not truncate. |
| 2 | Photo | No | Image, square, min 200×200px, `.jpg`/`.png`/`.webp` | If present, must resolve to a valid image; if absent or failed, use the shared default illustration | Circular crop, centred within the card. Fixed rendered size across all cards. |
| 3 | Role | Yes | Text, 1–35 chars | Non-empty; from the agreed role list [PLACEHOLDER — free text or fixed list? see Q5] | Rendered as `**Role:** <value>` on one line. |
| 4 | About blurb | Yes | Text, 1–600 chars | Non-empty after trim; plain text only, HTML/markdown escaped on render; content owner warned above 600 | Rendered as `**About <Name>:** <blurb>`. Clamps to 4 lines, with a "Read more" control that expands in place. |
| 5 | Alt text | Yes (derived) | Text | Auto-generated as "Photo of `<Member name>`" if not supplied | Applied to `<img alt>`; placeholder avatars get `alt=""` plus visible name. |

### 4.3 Layout and display rules

| # | Rule |
|---|------|
| D-1 | Cards render in a two-column grid on desktop, in the order defined in the content source. |
| D-2 | With an odd member count, the final card sits in the first column at its natural width - it does not stretch to fill the row. |
| D-3 | All cards in a row share equal height; the shorter card's whitespace sits below the content. |
| D-4 | Card order is fixed and explicit - no alphabetical or random sorting. |
| D-5 | Content order within a card is: name → photo → role → blurb. |
| D-6 | Grid collapses to a single column below a certain breakpoint: 768px. |
| D-7 | Cards are non-interactive apart from the "Read more" control - the card itself is not a link. |

---

## 5. Edge cases

| ID | Case | Expected behaviour |
|----|------|--------------------|
| EC-01 | Member has no headshot | Render the shared default illustration at the same size and circular crop as a real photo. One single asset reused for every member missing a photo. Layout must not shift. |
| EC-02 | Blurb longer than the card allows | Clamp to 4 lines with a "Read more" control that expands the full text in place. Expanded text pushes the card taller; it must not overlap adjacent cards or the row below. Control toggles to "Show less" when expanded |
| EC-03 | Blurb is one short line | Card renders at row height with trailing whitespace; no stretched text, no forced padding-out. |
| EC-04 | Role missing or empty | Content-source validation error. Do not render a bare "Role:" label. Fallback display: show team member |
| EC-05 | Very long name, or a single unbroken word | Wrap to a second line; apply word-break so it never overflows the card. Cap at 2 lines. |
| EC-06 | Photo is non-square or low resolution | Centre-crop to square, then circular mask. Below 200×200px, upscaling is not permitted. |
| EC-07 | Photo URL is valid but fails to load | Fall back to the EC-01 placeholder avatar via image error handling. No broken-image icon. |
| EC-09 | Blurb contains quotes, apostrophes, emoji, or markup | Escape on render. No HTML injection. Line breaks in the source collapse to spaces. |
| EC-9 | Narrow viewport / mobile | Single-column stack per D-6; "Read more" remains reachable and tappable at ≥44px. |
| EC-10 | Two members share a first name | "About `<full name>`" is used in the blurb label. |

---

## 6. Acceptance criteria

**Team page**

1. All 6 members render, each showing name, photo (or placeholder), role, and blurb.
2. The member without a headshot renders with the placeholder avatar and produces no layout shift versus the other cards.
3. Both long-blurb members render collapsed with a working "Read more" expand; expanding does not break the grid.
4. Removing or adding a member reflows the grid correctly with no code change.
5. The page renders correctly at desktop, tablet, and mobile widths.
6. All images have meaningful alt text; the "Read more" control is keyboard-operable and screen-reader labelled.

**Login page**

7. The page matches the approved Figma design.
8. No file outside the presentation layer is modified in the login commit - verified at code review.
9. Field labels, placeholder text, button text, and error copy are unchanged from the current implementation.
10. The login commit adds no OAuth dependency, route, or configuration.
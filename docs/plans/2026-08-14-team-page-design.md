# Team page design

## Outcome

Add a protected `/team` route and make it the destination after email, Google, or existing-session sign-in. Authentication, validation, cookies, and session handling remain unchanged.

## Structure

- The page is a Server Component that renders static team data.
- `TeamMemberCard` is the only Client Component. It owns image fallback and the accessible Read more / Show less state.
- Member content lives in a typed data module so records can be added or corrected without changing the layout.
- The existing protected dashboard route group provides the authentication guard.

## Interface

Match the approved Figma file: white canvas, compact Team34 wordmark, centered page heading, and restrained white cards with thin grey borders. Cards use a two-column desktop grid and collapse to one column below 768px. The final odd card keeps its natural column width.

Each card shows name, circular photo or shared fallback illustration, role, and an About section. Long copy is clamped to four lines until expanded. Controls have a minimum 44px target and descriptive accessible labels.

## Verification

Component tests cover collapsed/expanded copy and failed-image fallback. Project checks cover lint, formatting, TypeScript, dependency audit, and the complete test suite.

## Implementation record

Implemented on `feature/team-page` on 14 August 2026.

- `/team` is a standalone page matching the Figma canvas. It checks the server session directly and redirects unauthenticated requests to `/auth/signin`.
- Existing-session, email/password, and Google sign-in success paths now redirect to `/team`.
- Missing-photo fallback and long-blurb expansion are covered by component tests.
- Lint, TypeScript, production build, backend tests, frontend tests, and the high-severity dependency audit pass locally.
- A valid-login smoke test on the deployed URL remains for the separate testing/deployment task because it requires the configured Firebase environment and live deployment.

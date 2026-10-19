# SP-01: Access

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-14; approved design 2026-10-19.

## Outcome
Email/password registration, login, logout, and initial restaurant creation. Membership scopes every dashboard query and mutation.

## Acceptance
Reject invalid credentials and cross-menu access; passwords and tokens are hashed.

## Data
Admin, MenuAdmin, Session, RateLimit. See docs/schema.json.

## APIs
/api/auth/{signup,login,logout}. See docs/api/README.md.

## Permissions
Registration and login are anonymous but require the configured request origin and database-backed throttling. Dashboard reads require an unexpired session and menu membership. Logout deletes only the presented session.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
/login; /signup; /dashboard. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


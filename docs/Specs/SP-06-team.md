# SP-06: Team

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-15, FR-16; approved design 2026-10-19.

## Outcome
Invite by email, display pending/expired invites, revoke, accept once within seven days, and remove admins except the last.

## Acceptance
Lock menu row before mutations; accept only matching authenticated email; SMTP failures revoke unusable invitations.

## Data
Admin, MenuAdmin, Invitation. See docs/schema.json.

## APIs
/api/menus/:id/invitations; /api/menus/:id/admins; /api/invitations/accept. See docs/api/README.md.

## Permissions
Invite creation, revocation and member removal require menu membership. Existing-account acceptance requires a session whose email matches the invitation. Invited signup creates the account and membership atomically after validating the email and token.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
/dashboard Team; /invite/:token. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


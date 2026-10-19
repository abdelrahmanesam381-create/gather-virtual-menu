# SP-05: Page

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-12, FR-13; approved design 2026-10-19.

## Outcome
Edit optional header, banner, description, address, map URL, phone and email; one currency per menu.

## Acceptance
Empty fields omitted; map links require HTTP(S); live preview reflects edits.

## Data
Menu. See docs/schema.json.

## APIs
/api/menus/:id/page. See docs/api/README.md.

## Permissions
Page writes require an unexpired session, matching request origin and current menu membership. Public rendering is anonymous.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
/dashboard Page. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


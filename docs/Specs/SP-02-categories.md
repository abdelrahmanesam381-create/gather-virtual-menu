# SP-02: Categories

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-1, FR-2, FR-3, FR-9, FR-10, FR-11; approved design 2026-10-19.

## Outcome
Create, rename, delete and order categories. Deletion removes placements and preserves items in an unassigned list.

## Acceptance
Name required; delete confirmation; complete-list order; empty sections hidden publicly.

## Data
Category, Placement. See docs/schema.json.

## APIs
/api/menus/:id/categories; /api/menus/:id/category-order. See docs/api/README.md.

## Permissions
Every category mutation requires an unexpired session, matching request origin, and current membership of the menu, rechecked inside the menu lock.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
/dashboard Menu. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


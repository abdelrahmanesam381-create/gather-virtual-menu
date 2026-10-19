# SP-03: Items

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-4, FR-5, FR-7, FR-8, FR-9, FR-10, FR-11; approved design 2026-10-19.

## Outcome
Create/edit/delete/hide items, assign multiple categories and order placements independently.

## Acceptance
Title, exact decimal price and category required; preserve retained placement positions; validate all category IDs against menu.

## Data
Item, Placement. See docs/schema.json.

## APIs
/api/menus/:id/items; /api/menus/:id/item-order. See docs/api/README.md.

## Permissions
Every item mutation requires an unexpired session, matching origin and current menu membership. Every referenced category and item must belong to that menu.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
/dashboard Menu; item dialog. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


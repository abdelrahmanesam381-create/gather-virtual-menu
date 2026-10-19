# SP-07: Public menu

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-17, FR-18, FR-19, FR-20; approved design 2026-10-19.

## Outcome
Render ordered public menu without login, sticky navigation, metadata and contact footer. Save public snapshots after writes.

## Acceptance
Hidden items omitted; empty categories omitted; changes visible immediately on next server render, refresh open pages within 60 seconds.

## Data
Menu, Category, Item, Placement. See docs/schema.json.

## APIs
GET /m/:slug. See docs/api/README.md.

## Permissions
Public HTML, snapshots and image reads are anonymous. No admin/session/token data is included in public menu data.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
/m/:slug. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


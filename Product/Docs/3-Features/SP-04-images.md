# SP-04: Images

Owner: product/engineering. Status: implementation contract; human implementation review pending.
Source: PRD FR-6; approved design 2026-10-19.

## Outcome
Decode JPEG/PNG/WebP under 5 MB, resize to 1600 px maximum width and re-encode as WebP. Persist generated file names.

## Acceptance
Reject bad bytes, unsupported formats, oversized files and excessive dimensions; preview before save.

## Data
Item.photoUrl, Menu.bannerImageUrl. See docs/schema.json.

## APIs
/api/uploads; /media/:file. See docs/api/README.md.

## Permissions
Upload requires an authenticated admin, matching origin and per-admin throttling. Media reads are anonymous; only generated filenames are served. Attaching an uploaded URL to an item or page requires menu membership.

## States and errors
Loading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See docs/workflows.md.

## Surfaces
Item and Page photo controls. Keyboard access, visible labels and 360 px support required.

## Verification
Traceability maps tests; delivery evidence lives in docs/STATUS.md.

## Open questions
Operational deployment remains configurable; no unapproved business additions.


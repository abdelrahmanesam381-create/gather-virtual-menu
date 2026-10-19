# Enforceable rules

## BR-01: Access
Source: PRD FR-14.

Email/password registration, login, logout, and initial restaurant creation. Membership scopes every dashboard query and mutation.

Reject invalid credentials and cross-menu access; passwords and tokens are hashed.

## BR-02: Categories
Source: PRD FR-1, FR-2, FR-3, FR-9, FR-10, FR-11.

Create, rename, delete and order categories. Deletion removes placements and preserves items in an unassigned list.

Name required; delete confirmation; complete-list order; empty sections hidden publicly.

## BR-03: Items
Source: PRD FR-4, FR-5, FR-7, FR-8, FR-9, FR-10, FR-11.

Create/edit/delete/hide items, assign multiple categories and order placements independently.

Title, exact decimal price and category required; preserve retained placement positions; validate all category IDs against menu.

## BR-04: Images
Source: PRD FR-6.

Decode JPEG/PNG/WebP under 5 MB, resize to 1600 px maximum width and re-encode as WebP. Persist generated file names.

Reject bad bytes, unsupported formats, oversized files and excessive dimensions; preview before save.

## BR-05: Page
Source: PRD FR-12, FR-13.

Edit optional header, banner, description, address, map URL, phone and email; one currency per menu.

Empty fields omitted; map links require HTTP(S); live preview reflects edits.

## BR-06: Team
Source: PRD FR-15, FR-16.

Invite by email, display pending/expired invites, revoke, accept once within seven days, and remove admins except the last.

Lock menu row before mutations; accept only matching authenticated email; SMTP failures revoke unusable invitations.

## BR-07: Public menu
Source: PRD FR-17, FR-18, FR-19, FR-20.

Render ordered public menu without login, sticky navigation, metadata and contact footer. Save public snapshots after writes.

Hidden items omitted; empty categories omitted; changes visible immediately on next server render, refresh open pages within 60 seconds.

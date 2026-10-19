# Virtual Menu — implementation design

Status: Approved by the user on 2026-10-19 (“okay start to implement”). Source: root PRD dated 2026-10-16, schema.prisma, WORKFLOW.md. Original sources remain unchanged. Implementation review is a separate gate.

## Outcome and scope
Build the complete PRD MVP: a mobile-first public restaurant menu and an authenticated dashboard with Menu, Page, and Team tabs. Guests browse without accounts. No ordering, payment, reservations, inventory, or guest accounts.

## Proposed implementation choices
These are builder recommendations, not confirmed business rules: Next.js with TypeScript for server-rendered public pages and dashboard; PostgreSQL and the supplied Prisma data model; email/password authentication with hashed passwords and secure HTTP-only sessions; SMTP invitation delivery; validated and resized images stored through a storage adapter. Development runs locally; production credentials and deployment remain environment configuration.

Use /m/{slug} public URLs and isolate every dashboard read and write by menu membership. Support multiple menus at the data and authorization layers, with one initial restaurant onboarding flow. Default currency EGP, configurable per menu. Start with English; Arabic localization, dietary labels, QR generation, and owner sub-roles remain deferred pending product decisions. All admins have equal permissions as specified.

## Screens and behavior
- Sign up/sign in and initial restaurant setup; invite acceptance supports both new and existing accounts.
- Menu dashboard: ordered category sections, item editor, multiple category assignments, visibility toggle, image preview, drag-and-drop plus move buttons, and autosaved ordering.
- Category deletion confirms that placements are removed but items remain. Provide an unassigned-items view so preserved items can be reassigned; saving an item requires a category.
- Page dashboard: optional title, description, banner, contact fields, currency, and public preview.
- Team dashboard: admins, pending and expired invitations, invitation creation and revocation, and removal with a transactional last-admin safeguard.
- Public menu: branded header, sticky category navigation, ordered item cards, optional footer, and friendly empty state. Hide invisible items and categories without visible items.

## Data and backend contracts
Retain Admin, Menu, MenuAdmin, Category, Item, Placement, Invitation, and InvitationStatus from the supplied schema. Money remains Decimal(10,2); validate nonnegative prices. Per-category placement order is independent. Validate menu ownership of every category/item association on the server. Ordering updates are atomic, validate complete list membership, and have deterministic tie-breaking.

Sessions may require an additional session model, documented as an implementation extension. Hash invitation tokens, expire them after seven days, consume them once transactionally, and require the authenticated email to match. Use secure password hashing, login throttling, request validation, and CSRF protections. Serialize membership changes to prevent concurrent last-admin removal.

Accept JPEG, PNG, and WebP images up to a proposed 5 MB; decode and re-encode on the server, resize, and store generated names. Configure production storage separately from development storage.

Public pages render on the server with metadata and image dimensions. Invalidate cached menu content after mutations, with a maximum 60-second freshness window. Public snapshots must remain usable independently of dashboard rendering. Production backups and availability require deployment configuration and cannot be established by application code alone.

## Appearance and accessibility
Use a restrained restaurant editorial style: warm neutral surfaces, dark readable text, a single green accent, generous food imagery, and clear prices. Dashboard prioritizes readable lists and visible editing controls. Support 360 px phones through desktops, focus indicators, labeled forms, keyboard reorder controls, descriptive image alternatives, and accessible confirmation dialogs. Final visual treatment is a builder proposal.

## Delivery and verification
Follow WORKFLOW.md: build the product knowledge base, audit gaps, write fixed-template capability specs and traceability, produce module/API contracts, derive logical schema and generated enum/ERD documents, then implement in dependency order. Maintain status without claiming human review or merge.

Verify authentication and tenant isolation, price/category validation, preservation of items after category deletion, independent placement ordering, hidden public content, invitation expiry/revocation/single use, and concurrent last-admin protection. Run formatting, type checks, schema validation, production build, integration tests, and responsive/accessibility checks. Report performance and operational requirements as unverified unless measured in a representative environment.

No commits or merges without the approvals required by WORKFLOW.md.

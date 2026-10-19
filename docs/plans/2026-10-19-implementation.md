# Virtual Menu Implementation Plan

> For agentic workers: use superpowers:executing-plans to implement task by task.

**Goal:** Deliver the approved virtual menu MVP with a real PostgreSQL backend and a usable local application.
**Architecture:** Next.js server-rendered pages and JSON route handlers; Prisma transactions enforce membership and ordering. A shared public-menu component serves the public page and dashboard preview.
**Tech Stack:** Next.js, TypeScript, React, Prisma 6 (compatible with supplied schema), PostgreSQL, Zod, bcrypt, Sharp, SMTP.
**Spec:** [Approved design](2026-10-17-virtual-menu-design.md).

## Global constraints
Preserve original source files. No ordering or payments. Equal admin permissions. Prices are Decimal(10,2). Invitations expire after 7 days. Uploads accept JPEG/PNG/WebP up to 5 MB. No commits or merges without human review under WORKFLOW.md.

## Review focus
- Foreign-menu IDs must never read or modify another restaurant.
- Concurrent admin removals and invitation acceptance must remain safe.
- Deleting the final category preserves recoverable unassigned items.
- Failed uploads or SMTP delivery must surface actionable errors.
- Empty optional fields and 360 px layouts must remain usable.

## Task 1: Contracts and foundation
Files: Product/Docs, Product/Design, docs/Specs, docs/modules, docs/api, docs/schema.json, docs/tools/generate.mjs, package.json, prisma/schema.prisma.
- [x] Write domain capability contracts, source precedence, gaps, traceability, and schema generator; preserve original sources.
- [x] Create the application configuration and derived runtime schema with sessions and rate limits.
- [x] Run docs:check and prisma validate; expect reproducible generated files and a valid schema.

## Task 2: Validation, authentication, and access
Files: src/lib/validation.ts, src/lib/auth.ts, src/lib/db.ts, src/lib/http.ts, src/app/api/auth/[action]/route.ts, tests/domain.test.ts.
Interfaces: validated input schemas; currentAdmin(): Promise<Admin|null>; requireAdmin(): Promise<Admin>; withMenu(menuId, adminId, callback) serializes menu writes.
- [x] Write failing tests for price/category/URL/order validation and token expiry.
- [x] Implement validators, password hashing, hashed expiring sessions, sign up/sign in/out, database-backed throttling and origin checks.
- [x] Run unit tests; expect rejection of invalid values and valid token lifetimes.

## Task 3: Menu data and transactions
Files: src/lib/menu-service.ts, src/app/api/menus/[id]/[...action]/route.ts, tests/integration/menu.test.ts.
Interfaces: getDashboard(adminId, menuId?), mutateMenu(menuId, adminId, action, input), getPublicMenu(slug).
- [x] Write failing integration cases for isolation, orphan preservation, placement order, and last-admin/invite concurrency.
- [x] Implement categories/items/page/team endpoints, complete-list reordering, and transactional membership checks.
- [x] Run integration suite against an isolated PostgreSQL database; report unavailable infrastructure explicitly.

## Task 4: Uploads, mail, public serving
Files: src/lib/uploads.ts, src/lib/mail.ts, src/lib/public-menu.ts, src/app/api/uploads/route.ts, src/app/media/[file]/route.ts, src/app/m/[slug]/page.tsx.
- [x] Test upload decoding and maximum size, invitation state transitions and failure reporting.
- [x] Implement re-encoded image storage, SMTP/local outbox, public snapshots with cache refresh, metadata and empty state.
- [x] Verify public HTML and upload constraints.

## Task 5: Dashboard and onboarding
Files: src/components/dashboard.tsx, src/components/public-menu.tsx, src/components/auth-form.tsx, src/app/globals.css, src/app/page.tsx, src/app/dashboard/page.tsx, src/app/login/page.tsx, src/app/invite/[token]/page.tsx.
- [x] Build responsive Menu, Page and Team tabs, accessible editors, confirmations, category/item drag/drop and keyboard move buttons.
- [x] Build authentication/onboarding and invitation acceptance screens; reuse public renderer for live preview.
- [x] Verify CRUD, reload persistence, previews, hiding, empty states, keyboard controls, and narrow layouts.

## Task 6: Delivery evidence
Files: README.md, .github/workflows/ci.yml, docs/STATUS.md, docs/testing.md.
- [x] Run format check, type checking, docs consistency, schema validation, tests, and production build.
- [x] Obtain a fresh code review; fix material findings with regression tests.
- [x] Document setup, production requirements, evidence and remaining operational gaps; leave work awaiting human review.

## Execution rulings
- 2026-10-19: User approved the design and requested implementation; proceed without another plan approval.
- No Git repository exists. Work directly in the supplied workspace; do not initialize or commit protected metadata.
- Docker is installed but not running. Provide PostgreSQL setup and seek an isolated local test option without modifying unrelated services.

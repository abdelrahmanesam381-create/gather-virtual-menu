# Delivery status — 2026-10-19

Design approved by the user on 2026-10-19. **Implementation is ready for human review.** No commits, pushes, merges or production deployment have been performed; this workspace has no Git repository.

| Area | Implementation | Verification | Human approval / merge |
|---|---|---|---|
| Product knowledge base, contracts, traceability | Implemented | Schema/catalogue/source-copy/mirror checks pass | Pending |
| PostgreSQL schema, migration and sample seed | Implemented | Prisma validate, migrations and real database tests pass | Pending |
| Authentication and menu isolation | Implemented | Login/signup/origin and isolation tests pass | Pending |
| Categories, items, multiple placements, ordering | Implemented | CRUD, persistence, mouse/arrow ordering, independent placement order and orphan preservation pass | Pending |
| Page customization and public menu | Implemented | New-menu save, preview, metadata and hidden-item tests pass | Pending |
| Uploads | Implemented | Decode/resize, invalid input rejection, actual upload and pending-save tests pass | Pending |
| Invitations and team | Implemented | Local-outbox signup, expiry, single-use concurrency and last-admin protection pass | Pending |
| Independent public reader | Implemented | Snapshot-only serving without dashboard/database passes | Pending |
| Responsive design and accessibility | Implemented | 360 px overflow checks; public/dashboard automated WCAG AA scan has zero violations | Pending |
| CI definition | Added | Equivalent commands run locally; no hosted CI run without a repository | Pending |

## Final verification evidence

- `npm test`: **8 passed**.
- `npm run test:integration`: **4 passed** against isolated `virtual_menu_test` PostgreSQL database.
- `npm run test:browser`: **5 passed** in isolated headless Chrome.
- `npm run typecheck`: passed.
- `npm run build`: passed; all application/API routes built, no build tracing warnings.
- `npm exec prisma validate`: passed.
- `npm run format:check`: passed.
- `npm run check:patterns`: passed.
- `npm run docs:check`: passed; protected source copies, schema-derived catalogues and specification mirrors match.
- Independent code review completed. All four important findings fixed and covered by regression tests; see [review](REVIEW.md).

Automated accessibility checks cover the scanned public menu and dashboard; they are not a certification of every screen. Representative 4G/mobile performance is not measured. Real SMTP delivery is not tested; development uses a local outbox.

## Running locally

### Supabase connection — October 19, 2026

- Created **Gather Virtual Menu**, Frankfurt (`eu-central-1`), in the approved organization at the confirmed $0/month creation quote.
- Active `.env` now uses Supabase's session pooler with required client TLS and a dedicated table-owner role. Prisma migrations are applied.
- Copied and compared all 9 application tables: 2 admins, 2 menus, 2 memberships, 4 categories, 7 items, 7 placements, 0 invitations, 12 sessions and 12 rate-limit records at transfer time. The original local database and `.env.before-supabase` remain available.
- Verified live login/logout, authenticated dashboard and public menu; `db:check`, 8 unit tests, typecheck, docs check and changed-file formatting pass. The RLS migration's 5 integration tests passed against isolated local PostgreSQL before transfer.
- Verified all 10 tables (including migration metadata) have RLS and deny SELECT to `anon` and `authenticated`. Security advisor returned only expected informational [RLS-without-policy notices](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy): database access is through the application server, not Supabase Auth/Data API.
- Uploads and snapshots remain local. This connection does not deploy the website or configure SMTP.

- App: http://localhost:3000
- Sample public menu: http://localhost:3000/m/olive-table
- Random demo credentials: `var/demo-access.txt` (ignored by Git).
- Project-local PostgreSQL: loopback port 54329; data in `var/postgres`.
- Start the app with `npm run dev`; the current Supabase connection does not require the local database process. See [database notes](database.md) for local rollback and isolated test setup.
- Optional independent public reader: `npm run public:start`, port 3001.

## Remaining deployment work

Supabase PostgreSQL is connected. Remaining deployment work: HTTPS/domain, SMTP, durable shared upload/snapshot volumes, proxy body limits, supervised independent processes, daily backups and a restore drill. These require a deployment environment and credentials. Deferred product scope: Arabic/RTL, QR generation, dietary labels, owner roles and custom domains.

Next workflow gate: human implementation review; commit only after approval. Do not mark this work Done or Merged automatically.

# Gather — Virtual Menu

A restaurant menu platform built from the supplied PRD and Prisma schema. Includes email/password accounts, restaurant-scoped administration, categories and multi-category items, drag-and-drop and keyboard reordering, page customization, validated photo uploads, team invitations, and server-rendered public menus.

## Local setup

Requires Node.js 22+ and PostgreSQL. On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`.

```sh
npm install
```

Copy `.env.example` to `.env`. Choose either database option:

This workspace is already connected to Supabase. Keep its existing `.env` to use that connection; see [database configuration](docs/database.md). Run `npm run db:check` to verify it. The options below are for a fresh local setup.

- Docker: `docker compose up -d db` (uses port 5432).
- Project-local PostgreSQL: `npm run db:local` in a separate terminal. Set `DATABASE_URL` to `postgresql://menu:menu_local_only@127.0.0.1:54329/virtual_menu?schema=public`.

```sh
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Choose Create an account to create your restaurant. The app uses real database persistence, not a browser-only demo.

Optional sample restaurant:

```sh
node scripts/prepare-local.mjs
npm exec prisma db seed
```

This creates an independently generated demo password in ignored `var/demo-access.txt` and the public menu at `/m/olive-table`. The seed refuses to overwrite an existing account or restaurant. Included sample photographs are compressed WebP files; source URLs are in `scripts/sample-images.mjs` (Unsplash).

## Email and files

Development invitations are saved as JSON emails in `var/mail` when SMTP is not configured. Open the link in the generated message to test acceptance. This does not send real email. Production requires SMTP settings; failures revoke the pending invitation and show an error.

Photos are decoded, resized, and re-encoded as WebP before storage in `UPLOAD_DIR`. Public snapshots are saved to `SNAPSHOT_DIR` after content changes and used when database reads fail. Deploy both directories as durable shared volumes; they are runtime data and are not bundled into builds. Multi-instance hosts need the same volumes or an object-storage adapter. Daily database/image backups and availability monitoring are deployment responsibilities, not claims of this local build.

For independent public serving, run `npm run public:start` in a separate process. It serves `/m/{slug}`, images, and styles on loopback port 3001 using only saved snapshots, with no database or dashboard dependency. Route public menu requests to this process through your proxy. Run at least one content save to generate a snapshot. Configure independent process supervision and shared durable volumes in production. The public process also needs the source component, stylesheet and installed runtime packages; it is not included in Next.js standalone output.

Set `APP_URL` to the exact application origin (including port). Mutation requests require that origin. Use HTTPS in production; production session cookies are Secure and HTTP-only. Configure an upstream request-body limit of 6 MB and rate limiting at the proxy. Demo credentials and local database passwords must not be deployed.

## Verification

```sh
npm test
npm run typecheck
npm run docs:check
npm run format:check
npm run check:patterns
npm run build
```

For integration tests, set `TEST_DATABASE_URL` to a separate database, apply migrations there with `DATABASE_URL` set to that same URL, then run `npm run test:integration`. Tests create and delete only uniquely named fixture records.

Browser tests require a running local app, Chrome, and the optional sample seed (`var/demo-access.txt`): `npm run test:browser`. The tests create and remove temporary sample-menu content. Screenshots and accessibility findings are written to ignored `var/` directories. Automated accessibility checks do not establish complete WCAG conformance.

## Documentation

- [Implementation index](docs/README.md)
- [Delivery status and evidence](docs/STATUS.md)
- [Capability specifications](docs/Specs/README.md)
- [Source precedence](docs/PROVENANCE.md)
- [Approved design](docs/plans/2026-10-17-virtual-menu-design.md)
- [Execution plan](docs/plans/2026-10-19-implementation.md)

`WORKFLOW.md`, the root PRD, and root schema remain unchanged. `prisma/schema.prisma` adds sessions and shared rate-limit records to the supplied model. Logical model: `docs/schema.json`; generated enum and relationship documents: `npm run docs:generate`. CI checks protected-source copies and mirrored specifications.

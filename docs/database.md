# Database

## Supabase connection

The current workspace connects to **Gather Virtual Menu** in Frankfurt (`eu-central-1`), project `hlfngulkgcpdxuruormo`. The server-only `DATABASE_URL` in ignored `.env` uses the IPv4 session pooler on port 5432 with TLS and the dedicated `gather_app` database role. This role owns the application tables; it has no superuser or global RLS bypass permission. Prisma remains the migration and database client. Existing application authentication remains in use.

Run `npm run db:check` to verify connectivity, TLS, schema access and RLS. Run `npm run db:migrate` for future migrations. Application tables and Prisma migration metadata have RLS enabled and access revoked from public API roles; no browser Data API access is intended.

The existing local records were copied and compared with Supabase before switching `.env`. The local database remains in `var/postgres`; `.env.before-supabase` preserves its prior configuration. Both environment files contain secrets and must remain uncommitted. Uploaded files and public snapshots still reside in local `var/` directories, so they require durable storage when deploying.

Tests must continue to use an isolated local database. Do not point fixture suites at this shared Supabase project. To return to the previous local database, stop the app, restore `DATABASE_URL` from `.env.before-supabase`, start `npm run db:local`, then restart the app. Changes made in Supabase after the switch are not synchronized back to that local copy.

PostgreSQL is authoritative. prisma/schema.prisma is the deployable physical schema; docs/schema.json represents the logical model. The supplied root schema is preserved. Use committed SQL migrations with prisma migrate deploy. Reordering and membership mutations lock the menu row with SELECT FOR UPDATE, then validate current membership. Positions are not unique; sort ties by id. Prices use Decimal(10,2), never float storage. Test databases must be isolated from application data.

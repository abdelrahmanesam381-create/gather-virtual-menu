# Decisions

D-001: User approved implementation design on 2026-10-19: Next.js, Prisma/PostgreSQL, English first, /m/{slug}, EGP default, equal admins.
D-002: Runtime adds Session and RateLimit; original schema retained.
D-003: Development SMTP uses a local file outbox; production requires configured SMTP.
D-004: Local shared-volume uploads and public JSON snapshots are the initial storage adapter. Multi-instance production must mount shared storage or substitute an object adapter.
D-005: No Git repository exists; no commits or merge claims will be made.

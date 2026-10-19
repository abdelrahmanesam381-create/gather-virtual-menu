# Verification

Run npm test, npm run test:integration against TEST_DATABASE_URL, npm run typecheck, npm run docs:check, npm run format:check, npm run build. Integration tests create uniquely named fixtures and remove only their own menu/admin records. Never use production credentials.

Browser verification: sign up, category and item CRUD, multi-category placement, hide/show, reload, page preview, invite state, 360 px layout, keyboard reorder and confirmation dialogs. Performance under 4G and WCAG conformance require explicit measurements; do not infer them from a successful build.

Automated browser suite: `npm run test:browser`. Requires the local sample account and Chrome. Setup resets only the sample account's login throttle bucket for repeatable runs. The onboarding test creates temporary accounts/menu, exercises actual uploads, mouse ordering and invited signup, and removes its database fixtures.

Independent public serving: `tests/public-server.test.ts` starts a snapshot-only server on an ephemeral loopback port and verifies HTML, empty state, missing menus and path traversal rejection without a database connection.

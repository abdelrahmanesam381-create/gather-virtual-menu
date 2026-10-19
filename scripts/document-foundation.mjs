import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { dirname } from "node:path";
const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text + "\n");
};
for (const name of [
  "Virtual Menu Platform — PRD.md",
  "schema.prisma",
  "WORKFLOW.md",
]) {
  mkdirSync("Product/Drafted Planning", { recursive: true });
  copyFileSync(name, `Product/Drafted Planning/${name}`);
}
const capabilities = [
  [
    "01",
    "Access",
    "Admin, MenuAdmin, Session, RateLimit",
    "Email/password registration, login, logout, and initial restaurant creation. Membership scopes every dashboard query and mutation.",
    "FR-14",
    "/login; /signup; /dashboard",
    "/api/auth/{signup,login,logout}",
    "Reject invalid credentials and cross-menu access; passwords and tokens are hashed.",
  ],
  [
    "02",
    "Categories",
    "Category, Placement",
    "Create, rename, delete and order categories. Deletion removes placements and preserves items in an unassigned list.",
    "FR-1, FR-2, FR-3, FR-9, FR-10, FR-11",
    "/dashboard Menu",
    "/api/menus/:id/categories; /api/menus/:id/category-order",
    "Name required; delete confirmation; complete-list order; empty sections hidden publicly.",
  ],
  [
    "03",
    "Items",
    "Item, Placement",
    "Create/edit/delete/hide items, assign multiple categories and order placements independently.",
    "FR-4, FR-5, FR-7, FR-8, FR-9, FR-10, FR-11",
    "/dashboard Menu; item dialog",
    "/api/menus/:id/items; /api/menus/:id/item-order",
    "Title, exact decimal price and category required; preserve retained placement positions; validate all category IDs against menu.",
  ],
  [
    "04",
    "Images",
    "Item.photoUrl, Menu.bannerImageUrl",
    "Decode JPEG/PNG/WebP under 5 MB, resize to 1600 px maximum width and re-encode as WebP. Persist generated file names.",
    "FR-6",
    "Item and Page photo controls",
    "/api/uploads; /media/:file",
    "Reject bad bytes, unsupported formats, oversized files and excessive dimensions; preview before save.",
  ],
  [
    "05",
    "Page",
    "Menu",
    "Edit optional header, banner, description, address, map URL, phone and email; one currency per menu.",
    "FR-12, FR-13",
    "/dashboard Page",
    "/api/menus/:id/page",
    "Empty fields omitted; map links require HTTP(S); live preview reflects edits.",
  ],
  [
    "06",
    "Team",
    "Admin, MenuAdmin, Invitation",
    "Invite by email, display pending/expired invites, revoke, accept once within seven days, and remove admins except the last.",
    "FR-15, FR-16",
    "/dashboard Team; /invite/:token",
    "/api/menus/:id/invitations; /api/menus/:id/admins; /api/invitations/accept",
    "Lock menu row before mutations; accept only matching authenticated email; SMTP failures revoke unusable invitations.",
  ],
  [
    "07",
    "Public menu",
    "Menu, Category, Item, Placement",
    "Render ordered public menu without login, sticky navigation, metadata and contact footer. Save public snapshots after writes.",
    "FR-17, FR-18, FR-19, FR-20",
    "/m/:slug",
    "GET /m/:slug",
    "Hidden items omitted; empty categories omitted; changes visible immediately on next server render, refresh open pages within 60 seconds.",
  ],
];
write(
  "docs/README.md",
  "# Implementation documentation\n\nRead [provenance](PROVENANCE.md), [rules](business-rules.md), [specs](Specs/README.md), [execution plan](EXECUTION_PLAN.md), then [status](STATUS.md).\n\nDesign approved by user on 2026-10-19. Implementation review and merge are separate gates.",
);
write(
  "docs/PROVENANCE.md",
  "# Source precedence\n\n1. Explicit user decisions (design approved 2026-10-19).\n2. Original PRD for behavior, supplied Prisma schema for physical model.\n3. WORKFLOW.md for delivery governance.\n4. Approved design, then derived capability contracts.\n\nRoot sources are immutable; Product/Drafted Planning contains exact copies checked by docs:check. docs/schema.json is the logical schema authority; runtime Prisma additions are reviewed against it. Generated enums and ERD must never be edited manually. Product capability docs mirror implementation specs byte for byte, checked automatically.",
);
write(
  "docs/conventions.md",
  "# Conventions\n\nTypeScript strict mode. Server validation is mandatory. Errors use {error:string}; successful requests use {data:unknown}. HTTP 400 validation, 401 authentication, 403 origin, 404 inaccessible resource, 409 conflict, 429 throttling, 503 unavailable dependency. UTC timestamps; exact decimal strings at boundaries. All mutations verify Origin against APP_URL and current membership. No secrets or invitation tokens in logs.",
);
write(
  "docs/Specs/README.md",
  "# Capability specifications\n\n" +
    capabilities
      .map(
        ([id, name]) =>
          `- [SP-${id}: ${name}](SP-${id}-${name.toLowerCase().replaceAll(" ", "-")}.md)`,
      )
      .join("\n"),
);
write(
  "docs/business-rules.md",
  "# Enforceable rules\n\n" +
    capabilities
      .map(
        ([id, name, , behavior, refs, , , accept]) =>
          `## BR-${id}: ${name}\nSource: PRD ${refs}.\n\n${behavior}\n\n${accept}`,
      )
      .join("\n\n"),
);
write(
  "docs/Specs/TRACEABILITY.md",
  "# Traceability\n\n| Spec | PRD | Tables | Surface | API | Test |\n|---|---|---|---|---|---|\n" +
    capabilities
      .map(
        ([id, name, data, , refs, screens, api]) =>
          `| SP-${id} ${name} | ${refs} | ${data} | ${screens} | ${api} | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |`,
      )
      .join("\n"),
);
for (const [
  id,
  name,
  data,
  behavior,
  refs,
  screens,
  api,
  accept,
] of capabilities) {
  const text = `# SP-${id}: ${name}\n\nOwner: product/engineering. Status: implementation contract; human implementation review pending.\nSource: PRD ${refs}; approved design 2026-10-19.\n\n## Outcome\n${behavior}\n\n## Acceptance\n${accept}\n\n## Data\n${data}. See ../../schema.json.\n\n## APIs\n${api}. See ../../api/README.md.\n\n## Permissions\nPublic menu and media reads are anonymous. All other reads and writes require a session and current menu membership. Invite acceptance requires a matching email.\n\n## States and errors\nLoading, success, empty, validation failure and dependency failure are visible states. Failed writes do not show a success message. See ../../workflows.md.\n\n## Surfaces\n${screens}. Keyboard access, visible labels and 360 px support required.\n\n## Verification\nTraceability maps tests; delivery evidence lives in ../../STATUS.md.\n\n## Open questions\nOperational deployment remains configurable; no unapproved business additions.\n`;
  const filename = `SP-${id}-${name.toLowerCase().replaceAll(" ", "-")}.md`;
  write(`docs/Specs/${filename}`, text);
  write(`Product/Docs/3-Features/${filename}`, text);
  write(
    `docs/modules/${name.toLowerCase().replaceAll(" ", "-")}.md`,
    `# ${name} module\n\nGoverning contract: [SP-${id}](../Specs/${filename}).\n\n${behavior}\n\nData: ${data}. Server module: src/lib/${id === "01" ? "auth" : id === "04" ? "uploads" : id === "07" ? "public-menu" : "menu-service"}.ts. API boundary validates input before transaction. UI never establishes authorization.\n\nInvariant: ${accept}`,
  );
}
write(
  "docs/Specs/DECISIONS.md",
  "# Decisions\n\nD-001: User approved implementation design on 2026-10-19: Next.js, Prisma/PostgreSQL, English first, /m/{slug}, EGP default, equal admins.\nD-002: Runtime adds Session and RateLimit; original schema retained.\nD-003: Development SMTP uses a local file outbox; production requires configured SMTP.\nD-004: Local shared-volume uploads and public JSON snapshots are the initial storage adapter. Multi-instance production must mount shared storage or substitute an object adapter.\nD-005: No Git repository exists; no commits or merge claims will be made.",
);
write(
  "docs/Specs/CONFLICTS.md",
  "# Conflicts\n\nC-001: PRD says six entities but supplied schema contains seven models including joins. Resolution: preserve all seven supplied models.\nC-002: Item saves require categories, but category deletion preserves items. Resolution: deletion may orphan items; an unassigned list allows recovery, and future item saves require assignment.\nC-003: Workflow requires approval before commit; skills suggest frequent commits. Resolution: workflow and user authorization govern; leave uncommitted files for review.",
);
write(
  "docs/GAPS_AND_QUESTIONS.md",
  "# Operational and deferred gaps\n\n- Production host, PostgreSQL service, SMTP credentials, storage volume and domain are not supplied.\n- Daily backups, retention, restore drills, independent public-serving deployment and 4G performance measurements require an operating environment.\n- Arabic/RTL, QR codes, dietary labels, owner role and custom domains are deferred under approved design.\n- No application data is faked when the database is unavailable; show a setup error.\n- Development email outbox is not actual email delivery.",
);
write(
  "docs/workflows.md",
  "# State machines\n\nOnboarding: register → create admin and initial menu atomically → session → dashboard. Login verifies a bcrypt hash and issues a hashed session token. Logout removes that session.\n\nItem: visible ↔ hidden; delete removes placements; category deletion removes only placements. Saving always requires at least one category.\n\nInvitation: PENDING → ACCEPTED or REVOKED. Expired is derived when expiresAt <= now. Acceptance locks the menu, verifies email, checks pending/expiry, creates membership and consumes the token atomically. SMTP failure revokes the record.\n\nMutation: validate origin → session → menu lock → membership → payload/reference validation → transaction → refresh public snapshot → success.",
);
write(
  "docs/mapping.md",
  "# Business mapping\n\n| Business term | Prisma model | Storage |\n|---|---|---|\n| Restaurant menu | Menu | menus |\n| Admin | Admin | admins |\n| Membership | MenuAdmin | menu_admins |\n| Category | Category | categories |\n| Dish | Item | items |\n| Category item order | Placement | placements |\n| Invite | Invitation | invitations |\n| Login session | Session | sessions |",
);
write(
  "docs/api/README.md",
  "# API contract\n\nAll JSON mutations are same-origin POST requests. Success: {data:...}. Failure: {error:message}. Auth endpoints: POST /api/auth/signup, /login, /logout. Menu actions: POST /api/menus/:id/{categories,category-delete,category-order,items,item-delete,item-order,page,invitations,invite-revoke,admins}. Category and item upserts accept optional id. Delete accepts id. Order accepts ids; item-order also requires categoryId and uses placement ids. Team remove accepts adminId.\n\nPOST /api/uploads accepts multipart field file; it returns url. POST /api/invitations/accept accepts token. GET /media/:file accepts only generated filenames. GET /m/:slug returns server-rendered HTML. Dashboard server components read membership-scoped Prisma data directly.",
);
write(
  "docs/database.md",
  "# Database\n\nPostgreSQL is authoritative. prisma/schema.prisma is the deployable physical schema; docs/schema.json represents the logical model. The supplied root schema is preserved. Use committed SQL migrations with prisma migrate deploy. Reordering and membership mutations lock the menu row with SELECT FOR UPDATE, then validate current membership. Positions are not unique; sort ties by id. Prices use Decimal(10,2), never float storage. Test databases must be isolated from application data.",
);
write(
  "docs/testing.md",
  "# Verification\n\nRun npm test, npm run test:integration against TEST_DATABASE_URL, npm run typecheck, npm run docs:check, npm run format:check, npm run build. Integration tests create uniquely named fixtures and remove only their own menu/admin records. Never use production credentials.\n\nBrowser verification: sign up, category and item CRUD, multi-category placement, hide/show, reload, page preview, invite state, 360 px layout, keyboard reorder and confirmation dialogs. Performance under 4G and WCAG conformance require explicit measurements; do not infer them from a successful build.",
);
write(
  "docs/EXECUTION_PLAN.md",
  "# Execution order\n\n[Detailed plan](plans/2026-10-19-implementation.md).\n\nContracts/schema → auth → transactional menu services → media/mail/public rendering → dashboard → verification/review. Each capability depends on authentication except public reads. Human approval precedes commits; owner review and CI precede merge.",
);
const domains = {
  "1-Overview":
    "Restaurant teams maintain one public menu per restaurant. Guests browse without accounts. MVP excludes commerce. Read ../../../docs/Specs/README.md for capability contracts.",
  "2-Business":
    "All admins have equal access. Menu membership scopes all changes. See ../../../docs/business-rules.md and ../../../docs/Specs/DECISIONS.md.",
  "4-Technicals":
    "Next.js server rendering, JSON mutation handlers, Prisma/PostgreSQL transactions, bcrypt sessions, Sharp uploads and SMTP. See ../../../docs/api/README.md and ../../../docs/database.md.",
  "5-Architecture":
    "Browser → Next.js → authorized service → PostgreSQL. Shared image/snapshot volumes support public serving; SMTP delivers one-time invitations. See ../../../docs/plans/2026-10-17-virtual-menu-design.md.",
  "6-QA-Testing":
    "Validate domain rules, transaction concurrency, isolation, public HTML, responsive interactions and dependency failures. See ../../../docs/testing.md.",
  "7-DevOps-Release":
    "Configure database, SMTP, shared volumes and APP_URL before production. Daily encrypted backups and restore drills are operational requirements. Never run fixtures against production.",
  "8-Skills":
    "Engineering reads contracts before changes; QA traces requirements to tests; release owner approves commits and verifies evidence. No role may mark human review or merge complete automatically.",
  "9-Design":
    "Restaurant editorial presentation; quiet dashboard with visible editing affordances. Public menu is food-first and mobile-first. See ../../Design/docs/brief.md.",
};
for (const [dir, text] of Object.entries(domains))
  write(
    `Product/Docs/${dir}/README.md`,
    `# ${dir.slice(2)}\n\nOwner: product/engineering. Source: approved design and PRD.\n\n${text}`,
  );
write(
  "Product/Docs/README.md",
  "# Product knowledge base\n\n" +
    [...Object.keys(domains), "3-Features"]
      .sort()
      .map((x) => `- [${x}](${x}/)`)
      .join("\n"),
);
write(
  "Product/Design/docs/brief.md",
  "# Design brief\n\nGather is the working product name. The dashboard is a restaurant workbench: left navigation, a clear menu toolbar, ordered category sections and compact item rows. The public menu has a wide food banner, centered restaurant identity and generous item imagery. Use sage #426449, parchment #F8F9F5, white #FFFFFF, ink #223027, muted #637065 and border #DFE5DD. Use Georgia for restaurant display titles and system sans-serif for controls.\n\nDesktop: 230 px sidebar / flexible content. Mobile: top brand and horizontal navigation; controls wrap without horizontal scrolling. All icons have accessible labels. Display order uses drag handles and explicit move buttons. Avoid decorative metric cards: this MVP is menu editing, not analytics.",
);
write(
  "Product/Design/tokens/tokens.json",
  JSON.stringify(
    {
      colors: {
        accent: "#426449",
        background: "#F8F9F5",
        surface: "#FFFFFF",
        text: "#223027",
        muted: "#637065",
        border: "#DFE5DD",
      },
      radius: { control: 8, panel: 16 },
      sidebarWidth: 230,
    },
    null,
    2,
  ),
);
for (const screen of [
  "login",
  "signup",
  "menu",
  "item-editor",
  "page",
  "team",
  "invite",
  "public-menu",
])
  write(
    `Product/Design/docs/screen-specs/${screen}.md`,
    `# ${screen}\n\nSource: approved design; capability specs in docs/Specs. Use labeled controls, visible focus, keyboard operation, responsive 360 px layout, empty and error states. Mutations show pending state, prevent duplicate submission and report success only after server confirmation. Public menu never includes hidden items.\n\nImplementation: src/app and src/components. Verification recorded in docs/STATUS.md.`,
  );
write(
  "Product/Design/screens/README.md",
  "# Executable screens\n\nRun npm run dev. Dashboard: /dashboard. Public sample after seeding: /m/olive-table. Authentication: /login and /signup. These are the executable implementation rather than separate drifting prototypes.",
);
write(
  "Product/Design/docs/research/requirements.md",
  "# Requirement research\n\nThe supplied PRD is the product reference. No external visual reference was supplied. Distinguish guest browsing from admin editing; prioritize mobile reading, quick price updates and recoverable category deletion.",
);
write(
  "docs/STATUS.md",
  "# Delivery status\n\nDesign approved: 2026-10-19 by user.\n\n| Area | Implementation | Tests | Human review / merge |\n|---|---|---|---|\n| Contracts and plan | In progress | Consistency generator pending | Pending |\n| App and database | In progress | Pending | Pending |\n| Auth, menu, team, uploads | Not started | Pending | Pending |\n| Dashboard and public menu | Not started | Pending | Pending |\n\nNo Git repository; no commits or merges performed. Next: implement and verify the plan in dependency order.",
);
console.log("Documentation foundation written.");

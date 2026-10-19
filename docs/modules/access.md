# Access module

Governing contract: [SP-01](../Specs/SP-01-access.md).

Email/password registration, login, logout, and initial restaurant creation. Membership scopes every dashboard query and mutation.

Data: Admin, MenuAdmin, Session, RateLimit. Server module: src/lib/auth.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Reject invalid credentials and cross-menu access; passwords and tokens are hashed.

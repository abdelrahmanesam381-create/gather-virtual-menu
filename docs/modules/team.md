# Team module

Governing contract: [SP-06](../Specs/SP-06-team.md).

Invite by email, display pending/expired invites, revoke, accept once within seven days, and remove admins except the last.

Data: Admin, MenuAdmin, Invitation. Server module: src/lib/menu-service.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Lock menu row before mutations; accept only matching authenticated email; SMTP failures revoke unusable invitations.

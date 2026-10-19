# Page module

Governing contract: [SP-05](../Specs/SP-05-page.md).

Edit optional header, banner, description, address, map URL, phone and email; one currency per menu.

Data: Menu. Server module: src/lib/menu-service.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Empty fields omitted; map links require HTTP(S); live preview reflects edits.

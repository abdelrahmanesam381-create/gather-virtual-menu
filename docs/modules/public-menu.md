# Public menu module

Governing contract: [SP-07](../Specs/SP-07-public-menu.md).

Render ordered public menu without login, sticky navigation, metadata and contact footer. Save public snapshots after writes.

Data: Menu, Category, Item, Placement. Server module: src/lib/public-menu.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Hidden items omitted; empty categories omitted; changes visible immediately on next server render, refresh open pages within 60 seconds.

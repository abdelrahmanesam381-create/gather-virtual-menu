# Items module

Governing contract: [SP-03](../Specs/SP-03-items.md).

Create/edit/delete/hide items, assign multiple categories and order placements independently.

Data: Item, Placement. Server module: src/lib/menu-service.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Title, exact decimal price and category required; preserve retained placement positions; validate all category IDs against menu.

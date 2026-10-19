# Categories module

Governing contract: [SP-02](../Specs/SP-02-categories.md).

Create, rename, delete and order categories. Deletion removes placements and preserves items in an unassigned list.

Data: Category, Placement. Server module: src/lib/menu-service.ts. API boundary validates input before transaction. UI never establishes authorization.

Invariant: Name required; delete confirmation; complete-list order; empty sections hidden publicly.

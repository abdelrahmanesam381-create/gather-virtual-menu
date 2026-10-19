# Source precedence

1. Explicit user decisions (design approved 2026-10-19).
2. Original PRD for behavior, supplied Prisma schema for physical model.
3. WORKFLOW.md for delivery governance.
4. Approved design, then derived capability contracts.

Root sources are immutable; Product/Drafted Planning contains exact copies checked by docs:check. docs/schema.json is the logical schema authority; runtime Prisma additions are reviewed against it. Generated enums and ERD must never be edited manually. Product capability docs mirror implementation specs byte for byte, checked automatically.

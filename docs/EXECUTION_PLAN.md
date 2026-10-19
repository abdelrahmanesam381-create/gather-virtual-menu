# Execution order

[Detailed plan](plans/2026-10-19-implementation.md).

Contracts/schema → auth → transactional menu services → media/mail/public rendering → dashboard → verification/review. Each capability depends on authentication except public reads. Human approval precedes commits; owner review and CI precede merge.

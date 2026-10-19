# Conflicts

C-001: PRD says six entities but supplied schema contains seven models including joins. Resolution: preserve all seven supplied models.
C-002: Item saves require categories, but category deletion preserves items. Resolution: deletion may orphan items; an unassigned list allows recovery, and future item saves require assignment.
C-003: Workflow requires approval before commit; skills suggest frequent commits. Resolution: workflow and user authorization govern; leave uncommitted files for review.

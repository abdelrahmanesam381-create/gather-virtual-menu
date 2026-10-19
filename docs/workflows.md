# State machines

Onboarding: register → create admin and initial menu atomically → session → dashboard. Login verifies a bcrypt hash and issues a hashed session token. Logout removes that session.

Item: visible ↔ hidden; delete removes placements; category deletion removes only placements. Saving always requires at least one category.

Invitation: PENDING → ACCEPTED or REVOKED. Expired is derived when expiresAt <= now. Acceptance locks the menu, verifies email, checks pending/expiry, creates membership and consumes the token atomically. SMTP failure revokes the record.

Mutation: validate origin → session → menu lock → membership → payload/reference validation → transaction → refresh public snapshot → success.

# API contract

All JSON mutations are same-origin POST requests. Success: {data:...}. Failure: {error:message}. Auth endpoints: POST /api/auth/signup, /login, /logout. Menu actions: POST /api/menus/:id/{categories,category-delete,category-order,items,item-delete,item-order,page,invitations,invite-revoke,admins}. Category and item upserts accept optional id. Delete accepts id. Order accepts ids; item-order also requires categoryId and uses placement ids. Team remove accepts adminId.

POST /api/uploads accepts multipart field file; it returns url. POST /api/invitations/accept accepts token. GET /media/:file accepts only generated filenames. GET /m/:slug returns server-rendered HTML. Dashboard server components read membership-scoped Prisma data directly.

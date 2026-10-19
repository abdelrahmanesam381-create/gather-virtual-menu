# Traceability

| Spec | PRD | Tables | Surface | API | Test |
|---|---|---|---|---|---|
| SP-01 Access | FR-14 | Admin, MenuAdmin, Session, RateLimit | /login; /signup; /dashboard | /api/auth/{signup,login,logout} | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |
| SP-02 Categories | FR-1, FR-2, FR-3, FR-9, FR-10, FR-11 | Category, Placement | /dashboard Menu | /api/menus/:id/categories; /api/menus/:id/category-order | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |
| SP-03 Items | FR-4, FR-5, FR-7, FR-8, FR-9, FR-10, FR-11 | Item, Placement | /dashboard Menu; item dialog | /api/menus/:id/items; /api/menus/:id/item-order | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |
| SP-04 Images | FR-6 | Item.photoUrl, Menu.bannerImageUrl | Item and Page photo controls | /api/uploads; /media/:file | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |
| SP-05 Page | FR-12, FR-13 | Menu | /dashboard Page | /api/menus/:id/page | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |
| SP-06 Team | FR-15, FR-16 | Admin, MenuAdmin, Invitation | /dashboard Team; /invite/:token | /api/menus/:id/invitations; /api/menus/:id/admins; /api/invitations/accept | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |
| SP-07 Public menu | FR-17, FR-18, FR-19, FR-20 | Menu, Category, Item, Placement | /m/:slug | GET /m/:slug | tests/domain.test.ts; tests/integration/menu.test.ts; tests/uploads.test.ts; browser verification |

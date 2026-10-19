# Virtual Menu Platform — PRD

Oct 16, 2026 · @Abdelrahman Esam

## 1. Overview

The platform lets a restaurant publish its menu as one public web page, managed by a small team of admins from a dashboard. Guests open the page from a link or QR code, read the menu, and find the restaurant's location and contact details, with no login and no app.

**Problem.** Printed menus are slow and costly to update, go out of date, and are hard to share. A restaurant needs to change prices, items and layout in minutes without a developer.

**Product in one line.** One menu page per restaurant, edited by invited admins, viewed by anyone with the link.

**Primary users.** Restaurant owners and managers (admins) and diners (guests).

## 2. Goals and non-goals

The MVP succeeds if an admin can build a complete, good-looking menu and publish it in one sitting, and a guest can read it quickly on a phone.

**Goals**

- Let admins create and maintain categories and items without technical help.
- Give admins full control over the order of categories and of items inside each category.
- Present a fast, mobile-first public menu page with a branded header and a contact footer.
- Let several admins work on the same menu through invitations.

**Non-goals for the MVP**

- Online ordering, cart, checkout or payments.
- Table reservations, reviews or loyalty features.
- Guest accounts or any guest login.
- Inventory, stock levels or POS integration.
- Analytics dashboards beyond basic view counts (see Roadmap).

## 3. Users and roles

There are two roles: admins, who sign in and manage the menu, and guests, who only view it.

| Role | Signs in? | Can do |
| --- | --- | --- |
| Admin | Yes | Manage categories and items, set the display order, edit the page header and footer, invite other admins |
| Guest | No | View the public menu page |

The MVP has no admin sub-roles: every admin has the same permissions. An owner-versus-editor split is listed as an open question.

## 4. User stories

Each story has acceptance criteria that QA can test directly.

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| A1 | As an admin, I create, rename and delete categories (appetizers, main courses, drinks) | A category needs a name. Deleting a category with items asks for confirmation and states what happens to its items. |
| A2 | As an admin, I add an item with a photo, title, description and price | Title and price are required. Photo and description are optional. The photo previews before saving. |
| A3 | As an admin, I edit or delete an item | Changes appear on the public page after saving. Deletion asks for confirmation. |
| A4 | As an admin, I assign an item to one or more categories | An item can be saved only with at least one category. Changing the category moves the item on the public page. |
| A5 | As an admin, I reorder items inside a category | Drag and drop (with a keyboard alternative) updates the order. The order persists after reload and shows on the public page. |
| A6 | As an admin, I reorder categories on the main page | Same behaviour as A5, applied to the category list. |
| A7 | As an admin, I set the page title, banner image and description at the top | All three are optional. A page with none of them still renders correctly. |
| A8 | As an admin, I set the location and contact information at the bottom | Supports address, phone, email and a map link. Empty fields are hidden on the public page. |
| A9 | As an admin, I invite another admin by email | The invitee gets an email link, creates an account or signs in, and gains access to the menu. The inviter can see pending invites and revoke them. |
| G1 | As a guest, I open the menu page and browse it | The page loads without login, shows categories and items in the admin-defined order, and works on a phone. |
| G2 | As a guest, I jump to a category quickly | A category navigation bar scrolls to the matching section. |

## 5. Functional requirements

### 5.1 Categories

- **FR-1** Admins can create, rename, delete and reorder categories.
- **FR-2** A category has a name and a display order. An optional short description is a nice-to-have.
- **FR-3** Categories with no items are hidden from the public page but remain visible to admins.

### 5.2 Items

- **FR-4** An item has a photo, title, description and price.
- **FR-5** Title and price are required. The price is a single number shown with the menu's currency.
- **FR-6** Photos are uploaded by the admin, validated for type and size, and resized automatically for web display.
- **FR-7** An item can belong to one or more categories. Each item has its own display order inside each category it belongs to.
- **FR-8** Admins can hide an item temporarily without deleting it (for example when it is sold out).

### 5.3 Ordering

- **FR-9** Admins reorder items inside a category and categories on the main page using drag and drop.
- **FR-10** Order is saved automatically and is the same for every guest.
- **FR-11** New categories and items are added at the end of their list by default.

### 5.4 Page header and footer

- **FR-12** The header holds a page title, a banner image and a description. All are optional.
- **FR-13** The footer holds location (address and map link) and contact information (phone, email). Empty fields are not shown.

### 5.5 Admin access and invitations

- **FR-14** Admins sign in with email and password. Social sign-in is a future option.
- **FR-15** An admin can invite another admin by email. Invitation links expire after 7 days and can be revoked.
- **FR-16** Any admin can see the list of admins and remove an admin, except they cannot remove the last remaining admin.

### 5.6 Public menu page

- **FR-17** The menu is available at a public URL with no login.
- **FR-18** The page shows header, categories in order, items in order, then footer.
- **FR-19** Changes made by admins appear on the public page within 1 minute.
- **FR-20** The page includes a category navigation bar that scrolls to each section.

## 6. Data model

Six entities cover the MVP. A placement links an item to a category and stores its position there, which is how one item can sit in several categories with its own order in each.

&#91;embedded content: data model · 6 entities\]

Admins and menus are many-to-many. Deleting a category removes its placements but keeps the items, which stay available to assign elsewhere.

## 7. Page layout and UX

The public page is a single scrolling page, designed for phones first.

**Public menu page, top to bottom**

1. **Banner image** with the page title and description over or beneath it.
2. **Category navigation bar** that sticks to the top while scrolling.
3. **Category sections**, in admin order. Each shows its name, then its items in admin order.
4. **Item row or card** with photo, title, description and price.
5. **Footer** with location, map link and contact information.

**Admin dashboard**

- **Menu tab:** list of categories with their items nested underneath. Drag handles reorder both levels. Inline buttons add a category or an item.
- **Item editor:** a form (or side panel) with photo upload, title, description, price and category selection.
- **Page tab:** form for title, banner image and description (header) and for location and contact details (footer), with a live preview of the public page.
- **Team tab:** list of admins and pending invitations, with an invite-by-email field.

**Empty and error states.** A new menu shows a short checklist (add a category, add an item, set the page header). The public page of an empty menu shows the header and footer only, with a friendly message.

## 8. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | Public page loads in under 2 seconds on a mid-range phone on 4G. Images are resized, compressed and lazy-loaded. |
| Responsive design | Public page and admin dashboard work from 360 px wide phones to desktops. |
| Availability | The public menu stays available even if the admin dashboard is down (public pages are cached or statically served). |
| Security | Passwords are hashed. Admin routes need authentication. Only admins of a menu can change it. Invitation tokens are single-use and expire. |
| Uploads | Accepted types: JPG, PNG, WebP. Maximum size per upload to be set (suggested 5 MB). Files are scanned or validated server-side. |
| Accessibility | Meets WCAG 2.1 AA: alt text for images, sufficient contrast, keyboard-accessible reordering. |
| SEO and sharing | Public page is server-rendered with a title, description and share image so links preview well. |
| Data safety | Daily backups of the database and uploaded images. |

## 9. Success metrics

The targets below are proposals to adjust once real restaurants use the product.

| Metric | Proposed target | Why it matters |
| --- | --- | --- |
| Time to first published menu | Under 30 minutes for a new admin | Shows the dashboard is easy to learn |
| Admins who publish a menu within 7 days of signing up | At least 60% | Measures activation |
| Public page load time on 4G | Under 2 seconds | Guests leave slow pages |
| Menu edits per active restaurant per month | At least 4 | Shows the menu is kept current, the core value over print |
| Restaurants with more than one admin | At least 30% | Shows the invitation feature is used |

## 10. MVP scope and roadmap

The MVP covers every requirement in section 5. Later phases are candidates that depend on the open questions in section 11, and each phase starts only when the gate before it is met.

&#91;embedded content: roadmap · 3 phases, 2 gates\]

Phases are ordered, not dated. Dates can be added once the team size and launch target are known.

## 11. Assumptions, open questions and risks

**Assumptions made in this draft**

- Each menu has one public page and one team of admins. The MVP serves one restaurant per menu, and one account can own more than one menu later.
- An item can sit in several categories, with its own position in each.
- All admins have equal permissions.
- A menu uses one currency, shown next to each price.

**Open questions**

- [ ] Is this one platform for many restaurants (multi-tenant, each with its own URL) or a single restaurant for now?
- [ ] Does the menu need Arabic and English, including right-to-left layout?
- [ ] Should there be an owner role that alone can remove admins or delete the menu?
- [ ] What public URL format is wanted: a path, a subdomain, or the restaurant's own domain?
- [ ] Should guests see item labels such as vegetarian, spicy or allergens?
- [ ] Is a QR code generator for the menu link part of the MVP?

**Risks**

- **Image weight.** Large uploads slow the public page. Mitigation: automatic resizing and compression (FR-6).
- **Reordering complexity.** Drag and drop on touch screens can be fiddly. Mitigation: add move up and move down buttons.
- **Admin mistakes.** An accidental delete loses work. Mitigation: confirmation dialogs now, soft delete or undo later.

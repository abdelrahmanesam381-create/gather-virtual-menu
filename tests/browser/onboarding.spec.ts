import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";
test("new restaurant, real upload, drag ordering and invited signup work end to end", async ({
  page,
  browser,
}) => {
  process.loadEnvFile(".env");
  const db = new PrismaClient();
  const tag = randomUUID();
  const email = `owner-${tag}@example.test`;
  const invitedEmail = `invited-${tag}@example.test`;
  const headers = { Origin: "http://localhost:3000" };
  let menuId = "";
  let mailFile = "";
  let uploaded = "";
  try {
    const response = await page.request.post("/api/auth/signup", {
      headers,
      data: {
        name: "Test Owner",
        email,
        password: "BrowserTestPassword42!",
        restaurant: "Browser Test Table",
      },
    });
    expect(response.status()).toBe(200);
    const owner = await db.admin.findUniqueOrThrow({
      where: { email },
      include: { menus: true },
    });
    menuId = owner.menus[0].menuId;
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Let’s set the table" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Restaurant page", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save page changes", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Changes saved.");
    const upload = await page.request.post("/api/uploads", {
      headers,
      multipart: {
        file: {
          name: "photo.webp",
          mimeType: "image/webp",
          buffer: readFileSync("public/images/salad.webp"),
        },
      },
    });
    expect(upload.status()).toBe(200);
    uploaded = (await upload.json()).data.url;
    expect(uploaded).toMatch(/^\/media\/[a-f0-9-]+\.webp$/);
    expect((await page.request.get(uploaded)).headers()["content-type"]).toBe(
      "image/webp",
    );
    for (const name of ["Test starters", "Test mains"]) {
      const result = await page.request.post(
        `/api/menus/${menuId}/categories`,
        { headers, data: { name } },
      );
      expect(result.status()).toBe(200);
    }
    await page.reload();
    const headings = page.locator(".category-heading h2");
    await expect(headings).toHaveText(["Test starters", "Test mains"]);
    await page
      .getByRole("button", { name: "Move Test mains up", exact: true })
      .click();
    await expect(headings).toHaveText(["Test mains", "Test starters"]);
    await page
      .locator(".category-panel")
      .filter({
        has: page.getByRole("heading", { name: "Test starters", exact: true }),
      })
      .locator(".category-heading")
      .dragTo(
        page
          .locator(".category-panel")
          .filter({
            has: page.getByRole("heading", { name: "Test mains", exact: true }),
          })
          .locator(".category-heading"),
      );
    await expect(headings).toHaveText(["Test starters", "Test mains"]);
    const invite = await page.request.post(`/api/menus/${menuId}/invitations`, {
      headers,
      data: { email: invitedEmail },
    });
    expect(invite.status()).toBe(200);
    expect((await invite.json()).data.delivery).toBe("local-outbox");
    for (const file of readdirSync("var/mail")) {
      const message = JSON.parse(readFileSync(`var/mail/${file}`, "utf8"));
      if (message.to === invitedEmail) {
        mailFile = file;
        break;
      }
    }
    expect(mailFile).not.toBe("");
    const mail = JSON.parse(readFileSync(`var/mail/${mailFile}`, "utf8"));
    const token = mail.text.match(/\/invite\/([a-f0-9]{64})/)[1];
    const guest = await browser.newContext({
      baseURL: "http://localhost:3000",
    });
    try {
      const joined = await guest.request.post("/api/auth/signup", {
        headers,
        data: {
          name: "Invited teammate",
          email: invitedEmail,
          password: "BrowserTestPassword42!",
          inviteToken: token,
        },
      });
      expect(joined.status()).toBe(200);
      const admin = await db.admin.findUniqueOrThrow({
        where: { email: invitedEmail },
      });
      expect(
        await db.menuAdmin.count({ where: { menuId, adminId: admin.id } }),
      ).toBe(1);
      const reused = await guest.request.post("/api/invitations/accept", {
        headers,
        data: { token },
      });
      expect(reused.status()).toBe(400);
    } finally {
      await guest.close();
    }
  } finally {
    if (menuId) await db.menu.deleteMany({ where: { id: menuId } });
    await db.admin.deleteMany({
      where: { email: { in: [email, invitedEmail] } },
    });
    await db.$disconnect();
    if (/^[a-f0-9-]+\.json$/.test(mailFile)) unlinkSync(`var/mail/${mailFile}`);
    if (/^\/media\/[a-f0-9-]{36}\.webp$/.test(uploaded))
      unlinkSync(`var/uploads/${uploaded.split("/").pop()}`);
  }
});

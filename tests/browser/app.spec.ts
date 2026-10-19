import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
const access = readFileSync("var/demo-access.txt", "utf8");
const email = access.match(/Email: (.+)/)![1].trim();
const password = access.match(/Password: (.+)/)![1].trim();
test("dashboard editing, persistence, public rendering and responsive layouts", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your menu, beautifully served." }),
  ).toBeVisible();
  mkdirSync("var/screenshots", { recursive: true });
  await page.screenshot({
    path: "var/screenshots/dashboard-desktop.png",
    fullPage: true,
  });
  const name = `Browser ${Date.now()}`;
  await page
    .getByRole("button", { name: "Add a category", exact: true })
    .click();
  await page.getByLabel("Category name").fill(name);
  await page
    .getByRole("button", { name: "Save category", exact: true })
    .click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: `Add item to ${name}`, exact: true })
    .click();
  await page.getByLabel("Item name").fill("Browser test soup");
  await page.getByLabel("Price (EGP)").fill("45.50");
  await page.getByLabel("Description optional").fill("A fresh test dish.");
  await page.getByRole("button", { name: "Save item", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Browser test soup", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Browser test soup", exact: true }),
  ).toBeVisible();
  const publicPage = await context.newPage();
  await publicPage.goto("/m/olive-table");
  await expect(
    publicPage.getByRole("heading", { name: "Browser test soup", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Hide Browser test soup", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Show Browser test soup", exact: true }),
  ).toBeVisible();
  await publicPage.reload();
  await expect(
    publicPage.getByRole("heading", { name: "Browser test soup", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Restaurant page", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make it yours", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Restaurant name", { exact: true })
    .fill("The Olive Table");
  await page
    .getByRole("button", { name: "Save page changes", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Changes saved.");
  await page.getByRole("button", { name: "Team", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Team members" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /^Menu/ }).click();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    path: "var/screenshots/dashboard-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await publicPage.setViewportSize({ width: 360, height: 800 });
  await publicPage.screenshot({
    path: "var/screenshots/public-mobile.png",
    fullPage: true,
  });
  expect(
    await publicPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: `Delete ${name}`, exact: true })
    .click();
  await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /^Unassigned/ }).click();
  await expect(
    page.getByRole("button", { name: "Browser test soup", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Browser test soup", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Browser test soup", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("origin checks and authentication protect mutations", async ({
  request,
}) => {
  const denied = await request.post("/api/auth/login", {
    data: { email, password },
    headers: { Origin: "https://unrelated.example" },
  });
  expect(denied.status()).toBe(403);
  const anonymous = await request.post("/api/menus/nonexistent/categories", {
    data: { name: "No" },
    headers: { Origin: "http://localhost:3000" },
  });
  expect(anonymous.status()).toBe(401);
  const html = await request.get("/m/olive-table");
  expect(html.status()).toBe(200);
  const text = await html.text();
  expect(text).toContain("The Olive Table");
  expect(text).toContain("og:title");
  expect(text).not.toContain("Burrata &amp; heirloom tomatoes");
});

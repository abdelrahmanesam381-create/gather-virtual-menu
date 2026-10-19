import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("mobile retains sign out and item save waits for a pending upload", async ({
  page,
}) => {
  const access = readFileSync("var/demo-access.txt", "utf8");
  await page.goto("/login");
  await page
    .getByLabel("Email address")
    .fill(access.match(/Email: (.+)/)![1].trim());
  await page
    .getByLabel("Password", { exact: true })
    .fill(access.match(/Password: (.+)/)![1].trim());
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your menu, beautifully served." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page.getByLabel("Item name").fill("Pending photo");
  await page.getByLabel("Price (EGP)").fill("10");
  await page
    .getByRole("checkbox", { name: "Small plates", exact: true })
    .check();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/uploads", async (route) => {
    await pending;
    await route.fulfill({ json: { data: { url: "/images/salad.webp" } } });
  });
  await page
    .locator("input[type=file]")
    .setInputFiles("public/images/salad.webp");
  await expect(page.getByText("Uploading…", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save item", exact: true }),
  ).toBeDisabled();
  release();
  await expect(
    page.getByRole("button", { name: "Save item", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});

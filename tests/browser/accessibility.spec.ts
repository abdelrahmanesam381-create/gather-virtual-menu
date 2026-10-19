import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
test("public menu and dashboard have no automated WCAG AA violations", async ({
  page,
}) => {
  mkdirSync("var/reports", { recursive: true });
  await page.goto("/m/olive-table");
  const publicResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  writeFileSync(
    "var/reports/public-accessibility.json",
    JSON.stringify(publicResults.violations, null, 2),
  );
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
  const dashboardResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  writeFileSync(
    "var/reports/dashboard-accessibility.json",
    JSON.stringify(dashboardResults.violations, null, 2),
  );
  expect(
    publicResults.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  expect(
    dashboardResults.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});

import { test, expect } from "@playwright/test";

test.use({ headless: true, baseURL: "http://127.0.0.1:3000" });
test.setTimeout(90_000);

test("centre staff edit their profile, publish details, and use a restricted mobile navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/language-centre-admin/overview");
  await expect(
    page.getByRole("heading", { name: "Your courses", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Courses", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Finance Queue", exact: true })
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Centre Profile", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Centre name", exact: true })
    .fill("Browser Test Language Academy");
  await expect(
    page.getByRole("combobox", { name: "Centre type", exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole("combobox", { name: "University", exact: true })
  ).toHaveCount(0);
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles("tests/e2e/fixtures/test-image.png");
  await page
    .locator('input[type="file"]')
    .last()
    .setInputFiles("tests/e2e/fixtures/test-document.pdf");
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true })
  ).toBeEnabled();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Centre information saved." })
  ).toBeVisible();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Course intakes", exact: true })
  ).toBeVisible();
  await page.goto("/admin/language-centre-admins");
  await expect(
    page.getByRole("heading", { name: "Access restricted", exact: true })
  ).toBeVisible();
  await page.goto("/");
  await page.getByRole("link", { name: "Advisor", exact: true }).click();
  await page.goto("/partner/language-centers/lc_001");
  await expect(
    page
      .getByRole("heading", {
        name: "Browser Test Language Academy",
        exact: true,
      })
      .first()
  ).toBeVisible();
  await page.goto("/language-centre-admin/overview");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Your courses", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: /commissions|university management|platform settings/i,
    })
  ).toHaveCount(0);
  await page.screenshot({
    path: "/tmp/unibexs-centre-admin-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(
    page.getByRole("link", { name: "Courses", exact: true })
  ).toBeInViewport();
  await page.screenshot({
    path: "/tmp/unibexs-centre-admin-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});

test("platform admins reassign centre staff and suspension blocks their portal", async ({
  page,
}) => {
  await page.goto("/admin/language-centre-admins");
  const row = page
    .getByRole("row")
    .filter({ hasText: "Demo centre administrator" });
  await row.getByRole("button", { name: /More actions/ }).click();
  await page
    .getByRole("menuitem", { name: "Assign centre", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Assigned centre", exact: true })
    .click();
  await page.getByRole("option", { name: /Horizon Language Academy/ }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(row).toContainText("Horizon Language Academy");
  await page.goto("/language-centre-admin/centre-profile?centre_id=lc_002");
  await expect(
    page.getByRole("textbox", { name: "Centre name", exact: true })
  ).toHaveValue("Horizon Language Academy");
  await expect(
    page.getByText("Independent language centre", { exact: true })
  ).toBeVisible();
  await page.goto("/");
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await page.goto("/admin/language-centre-admins");
  await page
    .getByRole("row")
    .filter({ hasText: "Demo centre administrator" })
    .getByRole("button", { name: /More actions/ })
    .click();
  await page.getByRole("menuitem", { name: "Suspend", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Demo centre administrator" })
  ).toContainText("Suspended");
  await page.goto("/language-centre-admin/overview");
  await expect(
    page.getByText("Centre access unavailable", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your courses", exact: true })
  ).toHaveCount(0);
});

import { test, expect, Page } from "@playwright/test";
import path from "path";

const DOC_FIXTURE = path.join(__dirname, "fixtures", "test-document.pdf");
const IMAGE_FIXTURE = path.join(__dirname, "fixtures", "test-image.png");

async function mockAgencyInvitationAPIs(page: Page) {
  await page.route("**/api/partners/register/upload-url**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        upload_url: "https://mock-s3.example.com/upload",
        fields: { key: "agency-members/test.pdf", "Content-Type": "application/pdf" },
        file_key: "agency-members/test.pdf",
        public_url: "https://mock-s3.example.com/agency-members/test.pdf",
      }),
    }),
  );

  await page.route("https://mock-s3.example.com/upload", (route) =>
    route.fulfill({ status: 204 }),
  );

  await page.route("**/api/agency-invitations/submit", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Profile submitted", reference_id: "ref-member-1" }),
    }),
  );
}

async function waitForUpload(page: Page, nth: number) {
  await expect(page.getByText("Remove").nth(nth)).toBeVisible({ timeout: 10000 });
}

async function selectFromDropdown(page: Page, field: string, optionText: string) {
  await page.locator(`[data-field="${field}"]`).click();
  await page.getByPlaceholder("Search...").fill(optionText);
  await page.getByText(optionText, { exact: true }).click();
}

test.describe("Agency Member — Complete Profile (public invitation link)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAgencyInvitationAPIs(page);
    await page.goto("/team/accept-invite?token=test-submission-token");
  });

  test("has no Identity Document field", async ({ page }) => {
    await expect(page.getByText("Identity Document", { exact: true })).not.toBeVisible();
    await expect(page.locator("#member-passport-photo")).toHaveCount(1);
  });

  test("submits successfully without an identity document", async ({ page }) => {
    await page.locator('[data-field="profile_photo"] input[type="file"]').setInputFiles(IMAGE_FIXTURE);
    await waitForUpload(page, 0);

    await page.getByPlaceholder("12-345 6789").fill("123456789");
    await page.locator('[data-field="country"] select').selectOption({ label: "Malaysia" });
    await selectFromDropdown(page, "nationality", "Malaysian");
    await page.locator('[data-field="date_of_birth"] input').fill("1995-05-20");
    await page.getByPlaceholder("A12345678").fill("A12345678");

    await page.locator("label").filter({ hasText: "Education Agent" }).first().click();

    await page.locator('input[type="file"]#member-passport-photo').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 1);

    await page.locator('[data-field="social_media_url"] input').fill("https://www.instagram.com/newmember");

    const btn = page.getByRole("button", { name: "Complete Profile" });
    await expect(btn).toBeEnabled();
    await btn.click();

    await expect(page.getByText("Profile Submitted!")).toBeVisible();
  });

  test("shows invalid link message without a token", async ({ page }) => {
    await page.goto("/team/accept-invite");
    await expect(page.getByText("Invalid Link")).toBeVisible();
  });
});

import { test, expect, Page } from "@playwright/test";
import path from "path";

const DOC_FIXTURE = path.join(__dirname, "fixtures", "test-document.pdf");
const IMAGE_FIXTURE = path.join(__dirname, "fixtures", "test-image.png");

async function mockRegistrationAPIs(page: Page) {
  await page.route("**/api/partners/register/upload-url**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        upload_url: "https://mock-s3.example.com/upload",
        fields: { key: "partners/registration/test.pdf", "Content-Type": "application/pdf" },
        file_key: "partners/registration/test.pdf",
        public_url: "https://mock-s3.example.com/partners/registration/test.pdf",
      }),
    }),
  );

  await page.route("https://mock-s3.example.com/upload", (route) =>
    route.fulfill({ status: 204 }),
  );

  await page.route("**/api/partners/register/initiate", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "OTP sent to your email" }),
    }),
  );

  await page.route("**/api/partners/register/verify-otp", async (route) => {
    const body = route.request().postDataJSON();
    if (body.otp === "123456") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Verified", reference_id: "ref-abc-123" }),
      });
    } else {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Invalid or expired OTP" }),
      });
    }
  });

  await page.route("**/api/partners/register/resend-otp", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "OTP resent" }),
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

async function fillOtp(page: Page, code: string) {
  await page.locator('[data-field="otp"] input').first().click();
  await page.keyboard.type(code);
}

async function fillIndividualForm(page: Page) {
  await page.locator('[data-field="ind_profile_photo"] input[type="file"]').setInputFiles(IMAGE_FIXTURE);
  await waitForUpload(page, 0);

  await page.getByPlaceholder("Ahmed Ali").fill("Ahmed Alireza");
  await page.getByPlaceholder("name@mail.com").fill("ahmed@test.com");
  await page.getByPlaceholder("12-345 6789").fill("123456789");
  await page.locator('[data-field="country"] select').selectOption({ label: "Malaysia" });
  await selectFromDropdown(page, "nationality", "Malaysian");
  await page.locator('[data-field="date_of_birth"] input').fill("1995-05-20");
  await page.getByPlaceholder("A12345678").fill("A12345678");

  // Background selection
  await page.locator("label").filter({ hasText: "Education Agent" }).first().click();

  // Passport photo — no Identity Document field anymore
  await page.locator('input[type="file"]#ind-passport-photo').setInputFiles(DOC_FIXTURE);
  await waitForUpload(page, 1);

  await page.locator('[data-field="social_media_url"] input').fill("https://www.instagram.com/ahmedtest");

  // T&C
  await page.locator('input[type="checkbox"]').check();
}

async function fillCompanyForm(page: Page) {
  await page.locator('[data-field="comp_logo"] input[type="file"]').setInputFiles(IMAGE_FIXTURE);
  await waitForUpload(page, 0);

  await page.getByPlaceholder("Enter agency name.").fill("Global Edu Agency");
  await page.locator('[data-field="country"] select').selectOption({ label: "Malaysia" });
  await page.locator('[data-field="website_url"] input').fill("https://www.instagram.com/globaledu");

  // Company registration doc — Identity Document field no longer exists
  await page.locator('input[type="file"]#comp-reg-doc').setInputFiles(DOC_FIXTURE);
  await waitForUpload(page, 1);

  // Person in charge
  await page.getByPlaceholder("Enter full name.").fill("Sarah Johnson");
  await page.getByPlaceholder("contact@agency.com").fill("sarah@globaledu.com");
  await page.getByPlaceholder("12-345 6789").fill("987654321");
  await selectFromDropdown(page, "nationality", "Malaysian");
  await page.locator('[data-field="date_of_birth"] input').fill("1988-03-15");
  await page.getByPlaceholder("A12345678").fill("B98765432");

  await page.locator('input[type="file"]#comp-passport-photo').setInputFiles(DOC_FIXTURE);
  await waitForUpload(page, 2);

  // T&C
  await page.locator('input[type="checkbox"]').check();
}

test.describe("Partner Registration — Identity Document removed", () => {
  test.beforeEach(async ({ page }) => {
    await mockRegistrationAPIs(page);
    await page.goto("/auth/register");
  });

  test("individual form has no Identity Document field", async ({ page }) => {
    await page.getByRole("button", { name: "Individual Advisor" }).click();
    await expect(page.getByText("Identity Document", { exact: true })).not.toBeVisible();
    // Sibling upload fields are still present
    await expect(page.locator("#ind-passport-photo")).toHaveCount(1);
  });

  test("company form has no Identity Document field", async ({ page }) => {
    await page.getByRole("button", { name: "Company / Agency" }).click();
    await expect(page.getByText("Identity Document", { exact: true })).not.toBeVisible();
    await expect(page.locator("#comp-passport-photo")).toHaveCount(1);
  });
});

test.describe("Partner Registration — Individual", () => {
  test.beforeEach(async ({ page }) => {
    await mockRegistrationAPIs(page);
    await page.goto("/auth/register");
    await page.getByRole("button", { name: "Individual Advisor" }).click();
  });

  test("submit button is disabled until all required fields are filled", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Submit Application" })).toBeDisabled();
  });

  test("full individual registration flow → OTP → success, without an identity document", async ({ page }) => {
    await fillIndividualForm(page);

    const btn = page.getByRole("button", { name: "Submit Application" });
    await expect(btn).toBeEnabled();
    await btn.click();

    // OTP step
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("ahmed@test.com")).toBeVisible();

    await fillOtp(page, "123456");
    await page.getByRole("button", { name: "Verify Code" }).click();

    await expect(page.getByText("Application Submitted!")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Sign In" })).toBeVisible();
  });

  test("shows OTP error for wrong code", async ({ page }) => {
    await fillIndividualForm(page);
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await fillOtp(page, "000000");
    await page.getByRole("button", { name: "Verify Code" }).click();
    await expect(page.getByText("Invalid or expired OTP")).toBeVisible();
  });
});

test.describe("Partner Registration — Company", () => {
  test.beforeEach(async ({ page }) => {
    await mockRegistrationAPIs(page);
    await page.goto("/auth/register");
    await page.getByRole("button", { name: "Company / Agency" }).click();
  });

  test("submit button is disabled on load", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Submit Application" })).toBeDisabled();
  });

  test("full company registration flow → OTP → success, without an identity document", async ({ page }) => {
    await fillCompanyForm(page);

    const btn = page.getByRole("button", { name: "Submit Application" });
    await expect(btn).toBeEnabled();
    await btn.click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("sarah@globaledu.com")).toBeVisible();

    await fillOtp(page, "123456");
    await page.getByRole("button", { name: "Verify Code" }).click();
    await expect(page.getByText("Application Submitted!")).toBeVisible();
  });
});

test.describe("Registration page — navigation", () => {
  test("type switcher toggles between individual and company forms", async ({ page }) => {
    await page.goto("/auth/register");

    await page.getByRole("button", { name: "Individual Advisor" }).click();
    await expect(page.getByPlaceholder("Ahmed Ali")).toBeVisible();

    await page.getByRole("button", { name: "Company / Agency" }).click();
    await expect(page.getByPlaceholder("Enter agency name.")).toBeVisible();
    await expect(page.getByPlaceholder("Ahmed Ali")).not.toBeVisible();
  });
});

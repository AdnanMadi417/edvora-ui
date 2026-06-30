import { test, expect, Page } from "@playwright/test";
import path from "path";

const DOC_FIXTURE = path.join(__dirname, "fixtures", "test-document.pdf");

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

async function waitForUpload(page: Page, nthRemoveButton = 0) {
  await expect(page.getByText("Remove").nth(nthRemoveButton)).toBeVisible({ timeout: 10000 });
}

test.describe("Partner Registration — Individual", () => {
  test.beforeEach(async ({ page }) => {
    await mockRegistrationAPIs(page);
    await page.goto("/auth/register");
    await page.getByRole("button", { name: "Individual Advisor" }).click();
  });

  test("submit button is disabled until all required fields are filled", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Submit Application" })).toBeDisabled();
  });

  test("full individual registration flow → OTP → success", async ({ page }) => {
    await page.getByPlaceholder("Ahmed").fill("Ahmed");
    await page.getByPlaceholder("Ali").fill("Alireza");
    await page.getByPlaceholder("name@mail.com").fill("ahmed@test.com");
    await page.getByPlaceholder("12-345 6789").fill("123456789");
    await page.locator("select.rounded-lg").first().selectOption({ label: "Malaysia" });

    // Background selection
    await page.locator("label").filter({ hasText: "Education Agent" }).first().click();

    // Upload ID document
    await page.locator('input[type="file"]#ind-id-doc').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 0);

    // T&C
    await page.locator('input[type="checkbox"]').check();

    // Submit
    const btn = page.getByRole("button", { name: "Submit Application" });
    await expect(btn).toBeEnabled();
    await btn.click();

    // OTP step
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("ahmed@test.com")).toBeVisible();

    // Enter correct OTP
    await page.getByPlaceholder("• • • • • •").fill("123456");
    await page.getByRole("button", { name: "Verify OTP" }).click();

    // Success
    await expect(page.getByText("Application Submitted!")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Sign In" })).toBeVisible();
  });

  test("shows OTP error for wrong code", async ({ page }) => {
    await page.getByPlaceholder("Ahmed").fill("Ahmed");
    await page.getByPlaceholder("Ali").fill("Alireza");
    await page.getByPlaceholder("name@mail.com").fill("ahmed@test.com");
    await page.getByPlaceholder("12-345 6789").fill("123456789");
    await page.locator("select.rounded-lg").first().selectOption({ label: "Malaysia" });
    await page.locator("label").filter({ hasText: "Education Agent" }).first().click();
    await page.locator('input[type="file"]#ind-id-doc').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 0);
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await page.getByPlaceholder("• • • • • •").fill("000000");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page.getByText("Invalid or expired OTP")).toBeVisible();
  });

  test("OTP resend shows cooldown after sending", async ({ page }) => {
    await page.getByPlaceholder("Ahmed").fill("Ahmed");
    await page.getByPlaceholder("Ali").fill("Alireza");
    await page.getByPlaceholder("name@mail.com").fill("ahmed@test.com");
    await page.getByPlaceholder("12-345 6789").fill("123456789");
    await page.locator("select.rounded-lg").first().selectOption({ label: "Malaysia" });
    await page.locator("label").filter({ hasText: "Education Agent" }).first().click();
    await page.locator('input[type="file"]#ind-id-doc').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 0);
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    // Cooldown should already be running (60s timer started on submit)
    await expect(page.getByText(/Resend available in/)).toBeVisible();
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

  test("full company registration flow → OTP → success", async ({ page }) => {
    await page.getByPlaceholder("Enter company name.").fill("Global Edu Agency");
    await page.locator("select.rounded-lg").first().selectOption({ label: "Malaysia" });
    await page.getByPlaceholder("https://yourcompany.com").fill("https://globaledu.com");

    // Company registration doc
    await page.locator('input[type="file"]#comp-reg-doc').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 0);

    // Person in charge
    await page.getByPlaceholder("Enter full name.").fill("Sarah Johnson");
    await page.getByPlaceholder("contact@company.com").fill("sarah@globaledu.com");
    await page.getByPlaceholder("12-345 6789").fill("987654321");

    // Contact ID doc
    await page.locator('input[type="file"]#comp-contact-id-doc').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 1);

    // T&C
    await page.locator('input[type="checkbox"]').check();

    // Submit
    const btn = page.getByRole("button", { name: "Submit Application" });
    await expect(btn).toBeEnabled();
    await btn.click();

    // OTP step
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("sarah@globaledu.com")).toBeVisible();

    // Verify
    await page.getByPlaceholder("• • • • • •").fill("123456");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page.getByText("Application Submitted!")).toBeVisible();
  });
});

test.describe("Registration page — navigation", () => {
  test("type switcher toggles between individual and company forms", async ({ page }) => {
    await page.goto("/auth/register");

    await page.getByRole("button", { name: "Individual Advisor" }).click();
    await expect(page.getByPlaceholder("Ahmed")).toBeVisible();

    await page.getByRole("button", { name: "Company / Agency" }).click();
    await expect(page.getByPlaceholder("Enter company name.")).toBeVisible();
    await expect(page.getByPlaceholder("Ahmed")).not.toBeVisible();
  });

  test("success screen has a back to sign-in link", async ({ page }) => {
    await mockRegistrationAPIs(page);
    await page.goto("/auth/register");
    await page.getByRole("button", { name: "Individual Advisor" }).click();

    await page.getByPlaceholder("Ahmed").fill("Ahmed");
    await page.getByPlaceholder("Ali").fill("Alireza");
    await page.getByPlaceholder("name@mail.com").fill("ahmed@test.com");
    await page.getByPlaceholder("12-345 6789").fill("123456789");
    await page.locator("select.rounded-lg").first().selectOption({ label: "Malaysia" });
    await page.locator("label").filter({ hasText: "Education Agent" }).first().click();
    await page.locator('input[type="file"]#ind-id-doc').setInputFiles(DOC_FIXTURE);
    await waitForUpload(page, 0);
    await page.locator('input[type="checkbox"]').check();
    await page.getByRole("button", { name: "Submit Application" }).click();

    await page.getByPlaceholder("• • • • • •").fill("123456");
    await page.getByRole("button", { name: "Verify OTP" }).click();
    await expect(page.getByText("Application Submitted!")).toBeVisible();

    await page.getByRole("link", { name: "Back to Sign In" }).click();
    await expect(page).toHaveURL("/auth/sign-in");
  });
});

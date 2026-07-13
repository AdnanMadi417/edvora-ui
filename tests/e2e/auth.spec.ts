import { test, expect } from "@playwright/test";

const FAKE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.fake";

function mockLogin(page: Parameters<Parameters<typeof test>[1]>[0]["page"], opts: {
  passwordReset?: boolean;
  fail?: boolean;
}) {
  return page.route("**/api/auth/login", async (route) => {
    if (opts.fail) {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ detail: "Invalid credentials" }) });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access_token: FAKE_TOKEN, password_reset_required: opts.passwordReset ?? false }),
      });
    }
  });
}

function mockMe(page: Parameters<Parameters<typeof test>[1]>[0]["page"], role = "partner") {
  return page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "user-1", role, partner_id: "partner-1" }),
    });
  });
}

test.describe("Sign In", () => {
  test("button is disabled when fields are empty", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });

  test("shows email format error for invalid email", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByPlaceholder("Enter your email").fill("test@test");
    await page.getByPlaceholder("Enter your password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("shows password length error for short password", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByPlaceholder("Enter your email").fill("user@test.com");
    await page.getByPlaceholder("Enter your password").fill("short");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await mockLogin(page, { fail: true });
    await page.goto("/auth/sign-in");
    await page.getByPlaceholder("Enter your email").fill("wrong@test.com");
    await page.getByPlaceholder("Enter your password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("redirects partner to /partner/* on success", async ({ page }) => {
    // Catch-all registered first (LIFO = checked last), specific handlers registered after (checked first)
    await page.route("**/api/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
    );
    await mockLogin(page, { passwordReset: false });
    await mockMe(page, "partner");

    await page.goto("/auth/sign-in");
    await page.getByPlaceholder("Enter your email").fill("partner@test.com");
    await page.getByPlaceholder("Enter your password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/partner\//, { timeout: 10000 });
  });

  test("redirects to reset password when password_reset_required", async ({ page }) => {
    await page.route("**/api/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
    );
    await mockLogin(page, { passwordReset: true });
    await mockMe(page, "partner");

    await page.goto("/auth/sign-in");
    await page.getByPlaceholder("Enter your email").fill("newpartner@test.com");
    await page.getByPlaceholder("Enter your password").fill("temppassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/auth/partner-reset-password", { timeout: 10000 });
  });

  test("apply here link goes to register page", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.getByRole("link", { name: "Apply here" }).click();
    await expect(page).toHaveURL("/auth/register");
  });
});

test.describe("Partner Reset Password", () => {
  test("page is publicly accessible without a session", async ({ page }) => {
    await page.goto("/auth/partner-reset-password");
    await expect(page.getByRole("heading", { name: "Set your password" })).toBeVisible();
  });

  test("button is disabled when fields are empty", async ({ page }) => {
    await page.goto("/auth/partner-reset-password");
    await expect(page.getByRole("button", { name: "Update Password" })).toBeDisabled();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.goto("/auth/partner-reset-password");
    await page.getByPlaceholder("Enter your current password").fill("currentpass1");
    await page.getByPlaceholder("Min. 8 characters").fill("newpassword1");
    await page.getByPlaceholder("Re-enter new password").fill("differentpass");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("shows success state on valid submission", async ({ page }) => {
    await page.route("**/api/partners/reset-password", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "Password updated" }) }),
    );
    await page.goto("/auth/partner-reset-password");
    await page.getByPlaceholder("Enter your current password").fill("currentpass1");
    await page.getByPlaceholder("Min. 8 characters").fill("newpassword1");
    await page.getByPlaceholder("Re-enter new password").fill("newpassword1");
    await page.getByRole("button", { name: "Update Password" }).click();
    await expect(page.getByText("Password updated")).toBeVisible();
  });
});

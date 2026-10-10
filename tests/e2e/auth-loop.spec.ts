import { test, expect } from "@playwright/test";

/**
 * UBX-423: a failing session check must not loop between sign-in and the
 * role home page. Blocks /api/auth/me in the browser (the middleware's own
 * server-side check still succeeds, as it did in the 5 Oct incident) and
 * asserts the page stays put, retries a bounded number of times, and shows
 * the error state.
 *
 * Needs a real session: set E2E_TOKEN to a valid partner JWT for the backend
 * the dev server is configured with (NEXT_PUBLIC_API_URL). Skipped otherwise.
 *
 *   E2E_TOKEN=eyJ... pnpm test:e2e tests/e2e/auth-loop.spec.ts
 */
const TOKEN = process.env.E2E_TOKEN;
const OBSERVE_MS = 30_000;

test.describe("auth guard loop protection", () => {
  test.skip(!TOKEN, "Set E2E_TOKEN to a valid partner token to run this test");

  test("blocked /api/auth/me does not redirect and makes fewer than 10 requests in 30 s", async ({ page, context, baseURL }) => {
    test.setTimeout(OBSERVE_MS + 60_000);
    await context.addCookies([{ name: "token", value: TOKEN as string, url: baseURL as string }]);

    const apiRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/")) apiRequests.push(`${req.method()} ${req.url()}`);
    });
    const navigations: string[] = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url());
    });

    await page.route("**/api/auth/me", (route) => route.abort("failed"));

    await page.goto("/partner/applications");
    await page.waitForTimeout(OBSERVE_MS);

    expect(page.url()).toContain("/partner/applications");
    expect(navigations.filter((url) => url.includes("/auth/sign-in"))).toHaveLength(0);
    expect(navigations.length).toBeLessThanOrEqual(1);

    const meCalls = apiRequests.filter((r) => r.includes("/api/auth/me"));
    expect(meCalls.length).toBeLessThanOrEqual(4);
    expect(apiRequests.length).toBeLessThan(10);

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});

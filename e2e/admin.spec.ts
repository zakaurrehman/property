import { test, expect, type Page } from "@playwright/test";

/** Seeded demo admin (prisma/seed.ts). */
const ADMIN = { email: "admin@estatebureau.pk", password: "password123" };

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN.email);
  await page.getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((u) => !u.pathname.endsWith("/login"));
  // Prove the session actually exists — an unauthenticated /admin quietly
  // redirects to a perfectly healthy-looking login page.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin overview" })).toBeVisible();
}

test.describe("admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("every admin section renders", async ({ page }) => {
    for (const path of [
      "/admin",
      "/admin/moderation",
      "/admin/listings",
      "/admin/file-rates",
      "/admin/areas",
      "/admin/agents",
      "/admin/posts",
      "/admin/services",
      "/admin/projects",
      "/admin/reviews",
      "/admin/faqs",
      "/admin/careers",
      "/admin/careers/applications",
      "/admin/pages",
      "/admin/users",
      "/admin/leads",
      "/dashboard",
      "/dashboard/listings",
      "/profile",
    ]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator("body"), path).not.toContainText("Something went wrong");
    }
  });

  test("FAQ create → public page → delete", async ({ page }) => {
    const question = `E2E question ${Date.now()}?`;
    await page.goto("/admin/faqs/new");
    await page.getByLabel("Question").fill(question);
    await page
      .getByLabel("Answer")
      .fill("An answer written by the end-to-end suite, long enough to pass validation.");
    await page.getByLabel("Category").fill("E2E");
    await page.getByRole("button", { name: "Add FAQ" }).click();
    await page.waitForURL(/\/admin\/faqs$/);
    await expect(page.locator("tr", { hasText: question })).toHaveCount(1);

    await page.goto("/faq");
    await expect(page.locator("body")).toContainText(question);

    await page.goto("/admin/faqs");
    const row = page.locator("tr", { hasText: question });
    await row.getByRole("button", { name: /Delete/ }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(row).toHaveCount(0);
  });

  test("listing status change is reflected in the filter counts", async ({ page }) => {
    await page.goto("/admin/listings?status=ACTIVE");
    const row = page.locator("tbody tr").first();
    const ref = (await row.innerText()).match(/EB-\d+/)?.[0];
    expect(ref).toBeTruthy();

    await row.getByRole("combobox").click();
    await page.getByRole("option", { name: "Under offer", exact: true }).click();
    // The select fires a Server Action; wait for its toast before navigating.
    await expect(page.getByText("Status set to Under offer.")).toBeVisible();
    await page.goto("/admin/listings?status=UNDER_OFFER");
    await expect(page.locator("body")).toContainText(ref!);

    // Put it back so the suite is idempotent.
    const moved = page.locator("tr", { hasText: ref! });
    await moved.getByRole("combobox").click();
    await page.getByRole("option", { name: "Active", exact: true }).click();
    await expect(page.getByText("Status set to Active.")).toBeVisible();
    await page.goto("/admin/listings?status=ACTIVE");
    await expect(page.locator("body")).toContainText(ref!);
  });
});

import { test, expect, type Page } from "@playwright/test";

test("homepage search lands on filtered results", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("DHA Phase, block or society").fill("Phase 6");
  await page
    .getByRole("button", { name: /search/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/properties\?/);
  await expect(page.locator("body")).toContainText(/properties found/);
  await expect(page.locator('a[href^="/properties/"]').first()).toBeVisible();
});

async function resultCount(page: Page) {
  // The count is streamed in with the results — wait for it rather than
  // reading body text the moment the shell loads.
  const counter = page.getByText(/\d+ propert(y|ies) found/);
  await expect(counter).toBeVisible();
  return Number((await counter.innerText()).match(/(\d+)/)?.[1]);
}

test("filters narrow the listing count", async ({ page }) => {
  await page.goto("/properties");
  const all = await resultCount(page);
  expect(all).toBeGreaterThan(0);

  await page.goto("/properties?purpose=RENT");
  const rent = await resultCount(page);
  expect(rent).toBeGreaterThan(0);
  expect(rent).toBeLessThan(all);
});

test("property enquiry form validates then submits", async ({ page }) => {
  await page.goto("/properties");
  const href = await page.locator('a[href^="/properties/"]').first().getAttribute("href");
  await page.goto(href!);

  // Empty submit → validation messages, no request.
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await expect(page.locator("body")).toContainText("Enter your full name");

  await page.getByPlaceholder("Your full name").fill("E2E Buyer");
  await page.getByPlaceholder("+92 300 1234567").first().fill("+923001234567");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Send Enquiry" }).click();
  await expect(page.locator("body")).toContainText("Thanks — your enquiry was sent.");
});

test("mortgage calculator updates as inputs change", async ({ page }) => {
  await page.goto("/tools/mortgage-calculator");
  const before = await page.locator("body").innerText();
  await page.locator("#years").fill("30");
  await page.locator("#years").blur();
  const after = await page.locator("body").innerText();
  // Longer tenure → smaller monthly payment: the hero figure must change.
  expect(after).not.toBe(before);
  await expect(page.locator("body")).toContainText("Monthly payment");
});

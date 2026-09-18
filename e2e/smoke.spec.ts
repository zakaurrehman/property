import { test, expect, type Page } from "@playwright/test";

/** Every public route must render without the error boundary, in both locales. */
const PUBLIC_ROUTES = [
  "/",
  "/properties",
  "/properties?view=map",
  "/file-rates",
  "/areas",
  "/areas/lahore/dha-lahore",
  "/agents",
  "/blog",
  "/services",
  "/projects",
  "/reviews",
  "/faq",
  "/careers",
  "/about",
  "/contact",
  "/valuation",
  "/compare",
  "/saved",
  "/login",
  "/register",
  "/tools/mortgage-calculator",
  "/tools/investment-calculator",
  "/tools/price-trends",
  "/privacy",
  "/terms",
];

async function expectHealthy(page: Page) {
  const body = page.locator("body");
  await expect(body).not.toContainText("Something went wrong");
  await expect(body).not.toContainText("This page could not be found");
  // No horizontal overflow — the classic mobile layout defect.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(1);
}

for (const route of PUBLIC_ROUTES) {
  test(`renders ${route}`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expectHealthy(page);
  });
}

test("renders the Urdu locale, mirrored", async ({ page }) => {
  await page.goto("/ur");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ur");
  await expectHealthy(page);
});

test("redirects: /maps → map view, guarded routes → login", async ({ page }) => {
  await page.goto("/maps");
  await expect(page).toHaveURL(/\/properties\?view=map$/);
  for (const guarded of ["/profile", "/dashboard", "/admin"]) {
    await page.goto(guarded);
    await expect(page).toHaveURL(
      new RegExp(`/login\\?callbackUrl=${encodeURIComponent(guarded)}`),
    );
  }
});

test("SEO and PWA endpoints", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("<urlset");
  expect(xml).toContain('hreflang="ur"');

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toMatch(/Disallow: \/admin/);

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  expect(await manifest.json()).toMatchObject({ display: "standalone" });
});

test("detail pages carry structured data", async ({ page }) => {
  await page.goto("/properties");
  const href = await page.locator('a[href^="/properties/"]').first().getAttribute("href");
  expect(href).toBeTruthy();
  await page.goto(href!);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((s) => s.includes('"RealEstateListing"'))).toBe(true);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
});

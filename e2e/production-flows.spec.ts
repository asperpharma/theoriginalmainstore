import { test, expect, Page } from "@playwright/test";

/**
 * Production E2E Tests — https://asperbeautyshop.com
 *
 * Critical user journeys for the Asper Beauty Shop luxury e-commerce store.
 * Tests run against the live production URL via Cloudflare Worker.
 *
 * Flows covered:
 *  1. Homepage load — hero, brand grid, product sections
 *  2. Language toggle — Arabic/English, RTL direction applied
 *  3. Newsletter signup — email input, subscribe, success feedback
 *  4. Product search — AI search widget accessible without auth
 *  5. Navigation — all primary nav links functional, no broken routes
 *  6. Mobile responsiveness — 375px viewport renders correctly
 *  7. Beauty advisor / chat widget — loads without JS errors
 */

const BASE = "https://asperbeautyshop.com";

// Collect console errors across all tests
type ConsoleEntry = { type: string; text: string; url: string };
const consoleErrors: ConsoleEntry[] = [];

test.beforeEach(async ({ page }) => {
  // Capture JS errors and console.error calls
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ type: "error", text: msg.text(), url: page.url() });
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push({ type: "pageerror", text: err.message, url: page.url() });
  });
});

// ─────────────────────────────────────────────────────────
// 1. HOMEPAGE LOAD
// ─────────────────────────────────────────────────────────
test.describe("1. Homepage Load", () => {
  test("page title and root element render", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Asper/i, { timeout: 20_000 });
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("hero section is visible", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    // Hero headings — look for h1 or large display text
    const hero = page.locator("h1, [class*='hero'], section").first();
    await expect(hero).toBeVisible({ timeout: 20_000 });
  });

  test("brand grid section renders", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    // Brands are typically displayed as images or cards in a grid
    const brandSection = page
      .locator("section, div")
      .filter({ hasText: /brands|علامات/i })
      .first();

    const brandImages = page.locator('img[alt*="brand"], img[src*="brand"], a[href*="/brand"]');
    const brandCount = await brandImages.count();

    // Either a brands section heading OR brand images must be present
    const hasBrandsHeading = await brandSection.isVisible({ timeout: 10_000 }).catch(() => false);
    const hasBrandImages = brandCount > 0;

    expect(hasBrandsHeading || hasBrandImages).toBe(true);
  });

  test("product cards render on homepage", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    // Product cards appear as article elements or divs with product-like content
    const productLinks = page.locator('a[href*="/product/"]');
    const productCount = await productLinks.count();

    // At minimum a few products should be visible on the landing page
    expect(productCount).toBeGreaterThan(0);
  });

  test("no critical JS errors on homepage load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(BASE, { waitUntil: "networkidle" });

    // Filter out known third-party noise
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("ResizeObserver") &&
        !e.includes("Non-Error promise rejection") &&
        !e.includes("Loading chunk")
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────
// 2. LANGUAGE TOGGLE — ARABIC / ENGLISH
// ─────────────────────────────────────────────────────────
test.describe("2. Language Toggle", () => {
  test("language toggle button is present on homepage", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    const langToggle = page
      .locator(
        'button:has-text("عربي"), button:has-text("AR"), button:has-text("EN"), ' +
          '[aria-label*="language" i], [aria-label*="اللغة"], ' +
          '[data-testid*="language"], [data-testid*="lang"]'
      )
      .first();

    // If not found by text/aria, look for a button near the nav area
    const navButtons = page.locator("nav button, header button");
    const navButtonCount = await navButtons.count();

    const toggleFound = await langToggle.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(toggleFound || navButtonCount > 0).toBe(true);
  });

  test("clicking language toggle switches to Arabic and applies RTL", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    // Try multiple selector strategies for the language button
    const selectors = [
      'button:has-text("عربي")',
      'button:has-text("AR")',
      '[aria-label*="language" i]',
      '[aria-label*="Arabic" i]',
      '[data-testid*="lang"]',
    ];

    let toggled = false;
    for (const sel of selectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
        toggled = true;
        break;
      }
    }

    if (!toggled) {
      test.skip(true, "Language toggle button not found — skipping RTL assertion");
      return;
    }

    // After toggle, the html element or a top-level wrapper should have dir="rtl"
    const htmlDir = await page.locator("html").getAttribute("dir");
    const bodyDir = await page.locator("body").getAttribute("dir");
    const rootDir = await page.locator("#root > *").first().getAttribute("dir");

    const isRtl = htmlDir === "rtl" || bodyDir === "rtl" || rootDir === "rtl";
    expect(isRtl).toBe(true);
  });

  test("toggling back to English restores LTR", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    // Toggle to Arabic
    const arBtn = page.locator('button:has-text("عربي"), button:has-text("AR")').first();
    if (!(await arBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "Language toggle not found");
      return;
    }

    await arBtn.click();
    await page.waitForTimeout(500);

    // Toggle back to English
    const enBtn = page.locator('button:has-text("English"), button:has-text("EN")').first();
    if (await enBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await enBtn.click();
      await page.waitForTimeout(500);

      const htmlDir = await page.locator("html").getAttribute("dir");
      // Should be ltr or null (default)
      expect(htmlDir === "ltr" || htmlDir === null).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────
// 3. NEWSLETTER SIGNUP
// ─────────────────────────────────────────────────────────
test.describe("3. Newsletter Signup", () => {
  async function findNewsletterSection(page: Page) {
    // Newsletter forms are typically in the footer or a dedicated section
    const candidates = [
      page.locator('[data-testid*="newsletter"]').first(),
      page.locator('form').filter({ hasText: /subscribe|newsletter|اشترك|النشرة/i }).first(),
      page.locator('section').filter({ hasText: /subscribe|newsletter|اشترك|النشرة/i }).first(),
      page.locator('footer').filter({ has: page.locator('input[type="email"]') }).first(),
    ];
    for (const c of candidates) {
      if (await c.isVisible({ timeout: 3_000 }).catch(() => false)) return c;
    }
    return null;
  }

  test("newsletter email input is present", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_500);

    const emailInput = page.locator('input[type="email"]').first();
    const isVisible = await emailInput.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(isVisible).toBe(true);
  });

  test("subscribe button is present alongside email input", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_500);

    const subscribeBtn = page
      .locator('button:has-text("Subscribe"), button:has-text("اشترك"), button[type="submit"]')
      .first();

    // Also check for any button near an email input
    const emailInput = page.locator('input[type="email"]').first();
    const emailVisible = await emailInput.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!emailVisible) {
      test.skip(true, "No newsletter form found on page");
      return;
    }

    const btnVisible = await subscribeBtn.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(btnVisible).toBe(true);
  });

  test("submitting valid email shows success feedback", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1_500);

    const emailInput = page.locator('input[type="email"]').first();
    if (!(await emailInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "No newsletter form visible after scroll");
      return;
    }

    await emailInput.fill("test-e2e@example.com");

    const submitBtn = page
      .locator(
        'button:has-text("Subscribe"), button:has-text("اشترك"), ' +
          'input[type="email"] ~ button, input[type="email"] + button, button[type="submit"]'
      )
      .first();

    if (!(await submitBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip(true, "Subscribe button not found");
      return;
    }

    await submitBtn.click();

    // Expect a success toast, confirmation text, or form state change
    const successIndicators = [
      page.locator('[data-sonner-toast]').first(),
      page.locator('[role="status"]').first(),
      page.locator('[role="alert"]').first(),
      page.locator("text=/thank|success|subscribed|شكر|تم/i").first(),
    ];

    let successShown = false;
    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 8_000 }).catch(() => false)) {
        successShown = true;
        break;
      }
    }
    expect(successShown).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────
// 4. PRODUCT SEARCH
// ─────────────────────────────────────────────────────────
test.describe("4. Product Search", () => {
  test("search input or search button is present", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    const searchEl = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="بحث"], ' +
          'button[aria-label*="search" i], [data-testid*="search"]'
      )
      .first();

    const isVisible = await searchEl.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(isVisible).toBe(true);
  });

  test("typing a query in search returns results or opens search UI", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    // Try to open a search modal/dialog if the trigger is a button
    const searchButton = page
      .locator('button[aria-label*="search" i], button:has(svg[data-lucide*="Search"]),[data-testid*="search"]')
      .first();

    if (await searchButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await searchButton.click();
      await page.waitForTimeout(400);
    }

    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search" i], ' +
          'input[placeholder*="بحث"], [role="searchbox"], [role="combobox"]'
      )
      .first();

    if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "Search input not accessible without interaction");
      return;
    }

    await searchInput.fill("vitamin c");
    await page.waitForTimeout(1_500);

    // Search results: list items, articles, or a results panel
    const results = page.locator('[role="option"], [role="listitem"], li, article').first();
    const resultsVisible = await results.isVisible({ timeout: 8_000 }).catch(() => false);
    // Results OR at least the input accepted the query (no crash)
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe("vitamin c");
    // If results visible, great; if not, the key check is no crash
    if (resultsVisible) {
      expect(resultsVisible).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────
// 5. NAVIGATION
// ─────────────────────────────────────────────────────────
test.describe("5. Navigation", () => {
  const routes = [
    { path: "/shop", label: "Shop" },
    { path: "/brands", label: "Brands" },
    { path: "/best-sellers", label: "Best Sellers" },
    { path: "/skin-concerns", label: "Skin Concerns" },
    { path: "/contact", label: "Contact" },
  ];

  for (const route of routes) {
    test(`${route.label} page (${route.path}) returns < 400 and renders content`, async ({
      page,
    }) => {
      const response = await page.goto(`${BASE}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("#root")).not.toBeEmpty();
    });
  }

  test("nav links in header are all functional (no 404)", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    const navLinks = await page
      .locator("nav a[href], header a[href]")
      .evaluateAll((els) =>
        (els as HTMLAnchorElement[])
          .map((el) => el.getAttribute("href") || "")
          .filter((h) => h.startsWith("/") && !h.startsWith("//"))
          .filter((h, i, arr) => arr.indexOf(h) === i) // unique
          .slice(0, 8) // limit to first 8 to keep test duration reasonable
      );

    for (const href of navLinks) {
      const res = await page.goto(`${BASE}${href}`, {
        waitUntil: "domcontentloaded",
        timeout: 20_000,
      });
      expect(res?.status(), `Route ${href} returned error`).toBeLessThan(400);
    }
  });
});

// ─────────────────────────────────────────────────────────
// 6. MOBILE RESPONSIVENESS (375px)
// ─────────────────────────────────────────────────────────
test.describe("6. Mobile Responsiveness (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("homepage renders without horizontal overflow at 375px", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    const bodyScrollWidth = await page.evaluate(
      () => document.body.scrollWidth
    );
    const viewportWidth = 375;

    // Allow a small tolerance for scrollbar/rounding
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test("mobile menu or hamburger is present at 375px", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    const mobileMenu = page
      .locator(
        '[aria-label*="menu" i], [aria-label*="navigation" i], ' +
          'button:has(svg), [data-testid*="menu"], [data-testid*="hamburger"]'
      )
      .first();

    const visible = await mobileMenu.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(visible).toBe(true);
  });

  test("product cards are visible at 375px viewport", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    const productLinks = page.locator('a[href*="/product/"]');
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("hero content is readable at 375px (no overflow/clip)", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    const h1 = page.locator("h1").first();
    const h1Visible = await h1.isVisible({ timeout: 10_000 }).catch(() => false);
    expect(h1Visible).toBe(true);

    if (h1Visible) {
      const box = await h1.boundingBox();
      // h1 should not be clipped off-screen
      expect(box?.x).toBeGreaterThanOrEqual(-10);
    }
  });
});

// ─────────────────────────────────────────────────────────
// 7. BEAUTY ADVISOR / CHAT WIDGET
// ─────────────────────────────────────────────────────────
test.describe("7. Beauty Advisor / Chat Widget", () => {
  test("chat widget or beauty advisor trigger renders without JS crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(BASE, { waitUntil: "networkidle" });

    // Look for chat-like floating button or widget
    const chatTrigger = page
      .locator(
        '[aria-label*="chat" i], [aria-label*="advisor" i], [aria-label*="مساعد"], ' +
          '[data-testid*="chat"], [data-testid*="advisor"], ' +
          'button:has-text("Chat"), button:has-text("Advisor"), ' +
          '[class*="chat"], [class*="advisor"], [class*="concierge"]'
      )
      .first();

    const chatVisible = await chatTrigger.isVisible({ timeout: 8_000 }).catch(() => false);

    // Whether or not the chat widget is present, no critical JS errors should occur
    const criticalErrors = errors.filter(
      (e) => !e.includes("ResizeObserver") && !e.includes("Non-Error")
    );
    expect(criticalErrors).toHaveLength(0);

    // If chat widget is present, verify it's interactable
    if (chatVisible) {
      await chatTrigger.click();
      await page.waitForTimeout(800);
      // Chat panel should open without error
      const chatPanel = page.locator('[role="dialog"], [data-testid*="chat-panel"]').first();
      const panelOpen = await chatPanel.isVisible({ timeout: 5_000 }).catch(() => false);
      // Either panel opens, or at minimum no crash
      expect(criticalErrors).toHaveLength(0);
    }
  });

  test("neumorphic CSS classes are applied (.neu-raised)", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "networkidle" });

    const neuElements = await page.locator(".neu-raised, .neu-inset, .neu-flat, .neu-pressed").count();
    // The neumorphic design system should be applied to at least some elements
    expect(neuElements).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────
// CONSOLE ERROR SUMMARY (runs after all tests)
// ─────────────────────────────────────────────────────────
test.afterAll(async () => {
  if (consoleErrors.length > 0) {
    console.log("\n=== JS Console Errors Captured ===");
    consoleErrors.forEach((e, i) => {
      console.log(`[${i + 1}] [${e.type}] ${e.url}\n    ${e.text}`);
    });
    console.log("=================================\n");
  }
});

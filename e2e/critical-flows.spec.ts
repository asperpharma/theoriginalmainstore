import { test, expect } from "@playwright/test";

test.describe("Asper Beauty Shop — Critical User Flows", () => {
  test("homepage loads with content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/Asper Beauty/i);
    await expect(page.locator("#root")).not.toBeEmpty();
    await expect(page.locator("section, div").first()).toBeVisible({ timeout: 15000 });
  });

  test("shop page loads products", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    const productCards = page.locator("article");
    await expect(productCards.first()).toBeVisible({ timeout: 20000 });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("product detail page loads from shop", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    const firstProduct = page.locator("article").first();
    await expect(firstProduct).toBeVisible({ timeout: 20000 });
    await firstProduct.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("brands page loads", async ({ page }) => {
    await page.goto("/brands");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("skin concerns page loads", async ({ page }) => {
    await page.goto("/skin-concerns");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("cart opens and shows empty state", async ({ page }) => {
    await page.goto("/");
    const cartButton = page.locator('button:has(svg)').filter({ hasText: /bag|cart|سلة/i }).first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await expect(page.locator("text=/empty|فارغة/i").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("language toggle switches to Arabic", async ({ page }) => {
    await page.goto("/");
    const langToggle = page.locator('button:has-text("عربي"), button:has-text("AR"), [aria-label*="language"], [aria-label*="اللغة"]').first();
    if (await langToggle.isVisible()) {
      await langToggle.click();
      await page.waitForTimeout(500);
      const dir = await page.locator("html").getAttribute("dir");
      expect(dir).toBe("rtl");
    }
  });

  test("navigation links work", async ({ page }) => {
    const routes = ["/shop", "/brands", "/best-sellers", "/contact"];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    }
  });

  test("responsive: mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page.locator("#root")).not.toBeEmpty();
  });
});

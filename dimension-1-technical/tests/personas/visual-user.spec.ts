/**
 * visual_user persona — visual regression
 *
 * Captures screenshots of each page and compares them against the
 * standard_user baseline stored in tests/personas/__snapshots__/.
 *
 * To update baselines after an intentional visual change:
 *   npx playwright test --project=visual-user --update-snapshots
 *
 * On first run, baselines are created automatically.
 * Session is pre-loaded via storageState (visual.json).
 */

import { test, expect } from '@playwright/test';
import { PRODUCTS } from '../../test-data/products';
import { CHECKOUT_INFO } from '../../test-data/checkout';

const SNAPSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.02, // allow up to 2% pixel diff (handles anti-aliasing / font variance)
  threshold: 0.2,          // per-pixel colour tolerance (0–1)
};

test.describe('Persona: visual_user — visual regression', () => {
  test('inventory page matches standard_user baseline', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page.locator('.inventory_list')).toBeVisible();

    await expect(page).toHaveScreenshot('inventory.png', SNAPSHOT_OPTIONS);
  });

  test('product detail page matches baseline', async ({ page }) => {
    await page.goto('/inventory.html');
    await page
      .locator('.inventory_item_name')
      .filter({ hasText: PRODUCTS[0].name })
      .click();
    await page.waitForURL(/inventory-item/);

    await expect(page).toHaveScreenshot('product-detail.png', SNAPSHOT_OPTIONS);
  });

  test('cart page matches baseline', async ({ page }) => {
    await page.goto('/inventory.html');
    await page
      .locator(`[data-test="${PRODUCTS[0].addToCartSelector}"]`)
      .click();
    await page.goto('/cart.html');

    await expect(page).toHaveScreenshot('cart.png', SNAPSHOT_OPTIONS);
  });

  test('checkout step 1 page matches baseline', async ({ page }) => {
    await page.goto('/inventory.html');
    await page
      .locator(`[data-test="${PRODUCTS[0].addToCartSelector}"]`)
      .click();
    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);

    await expect(page).toHaveScreenshot('checkout-step-one.png', SNAPSHOT_OPTIONS);
  });

  test('visual_user can complete checkout functionally', async ({ page }) => {
    // Functional verification — visual_user should not be broken,
    // only visually degraded.
    await page.goto('/inventory.html');
    await page
      .locator(`[data-test="${PRODUCTS[0].addToCartSelector}"]`)
      .click();
    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);

    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
    await page.fill('[data-test="postalCode"]', CHECKOUT_INFO.postalCode);
    await page.click('[data-test="continue"]');
    await page.waitForURL(/checkout-step-two/);

    await page.click('[data-test="finish"]');
    await page.waitForURL(/checkout-complete/);

    await expect(page.locator('[data-test="complete-header"]')).toHaveText(
      'Thank you for your order!'
    );
  });
});

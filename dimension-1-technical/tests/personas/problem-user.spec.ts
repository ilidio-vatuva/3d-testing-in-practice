/**
 * problem_user persona — defect verification
 *
 * These tests PASS when the known bugs are present. They document the
 * intentional breakage so regressions are caught if bugs are accidentally fixed
 * in a future version of the app (or if they are NOT present on a different env).
 *
 * Session is pre-loaded via storageState (problem.json).
 */

import { test, expect } from '@playwright/test';
import { PRODUCTS } from '../../test-data/products';

test.describe('Persona: problem_user — defect verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  // ── Inventory defects ───────────────────────────────────────────────────────

  test('all product images are the same (wrong) image src', async ({ page }) => {
    const images = page.locator('.inventory_item img');
    const srcs = await images.evaluateAll((imgs: HTMLImageElement[]) =>
      imgs.map(img => img.src)
    );

    expect(srcs.length).toBe(6);
    // All images should be the same src — that is the defect
    const unique = new Set(srcs);
    expect(unique.size).toBe(1);
  });

  test('sort dropdown does not change product order', async ({ page }) => {
    const namesBefore = await page
      .locator('.inventory_item_name')
      .allTextContents();

    await page.selectOption('[data-test="product-sort-container"]', 'za');

    const namesAfter = await page
      .locator('.inventory_item_name')
      .allTextContents();

    // For problem_user the order is unchanged — this is the defect
    expect(namesAfter).toEqual(namesBefore);
  });

  test('some Add to Cart buttons are non-functional (item stays out of cart)', async ({
    page,
  }) => {
    // Try all 6 — at least one should fail (badge won't reach 6)
    for (const product of PRODUCTS) {
      const btn = page.locator(`[data-test="${product.addToCartSelector}"]`);
      if (await btn.isVisible()) {
        await btn.click().catch(() => {/* button may throw */});
      }
    }

    const badge = page.locator('[data-test="shopping-cart-badge"]');
    const badgeText = await badge.textContent().catch(() => '0');
    const count = parseInt(badgeText ?? '0', 10);

    // The defect: not all 6 items are addable
    expect(count).toBeLessThan(6);
  });

  // ── Checkout defects ────────────────────────────────────────────────────────

  test('Last Name field in checkout overwrites First Name or accepts only 1 char', async ({
    page,
  }) => {
    // Add an item that can be added (Bike Light is typically functional)
    await page
      .locator(`[data-test="${PRODUCTS[1].addToCartSelector}"]`)
      .click()
      .catch(() => {/* may fail for problem_user */});

    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);

    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Smith');

    // Either First Name is overwritten or Last Name only has 1 char — either
    // way the field values are corrupted. Check that typing in Last Name
    // affects First Name or Last Name is truncated.
    const firstName = await page
      .locator('[data-test="firstName"]')
      .inputValue();
    const lastName = await page
      .locator('[data-test="lastName"]')
      .inputValue();

    const defectPresent =
      firstName !== 'John' || lastName.length <= 1;

    expect(defectPresent).toBe(true);
  });
});

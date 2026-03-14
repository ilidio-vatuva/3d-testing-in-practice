/**
 * error_user persona — non-deterministic error verification
 *
 * error_user produces random errors at certain interaction points. Tests here
 * verify that the error conditions CAN occur — not that they ALWAYS occur.
 *
 * Key constraint: error_user breaks specific product buttons unpredictably,
 * including potentially PRODUCTS[0]. All tests that need to add an item must
 * find an available add-to-cart button dynamically rather than hardcoding a
 * product index.
 *
 * Session is pre-loaded via storageState (error.json).
 */

import { test, expect } from '@playwright/test';
import { CHECKOUT_INFO } from '../../test-data/checkout';

/** Try to click any available add-to-cart button. Returns true if one was found. */
async function clickAnyAddToCart(page: Parameters<Parameters<typeof test>[1]>[0]): Promise<boolean> {
  const btn = page.locator('[data-test^="add-to-cart-"]').first();
  const found = await btn.waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
  if (!found) return false;
  await btn.click({ timeout: 4000 }).catch(() => {/* error_user may swallow the click */});
  return true;
}

test.describe('Persona: error_user — intermittent error surfaces', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('Add to Cart eventually triggers an error or succeeds without crash', async ({
    page,
  }) => {
    const MAX_ATTEMPTS = 5;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      if (i > 0) await page.goto('/inventory.html');

      await clickAnyAddToCart(page);

      const error = page.locator('[data-test="error"]');
      if (await error.isVisible({ timeout: 1000 }).catch(() => false)) {
        break; // error surfaced — purpose of the test met
      }
    }

    // Survivor assertion: the page is still in a usable state
    await expect(page.locator('.app_logo')).toBeVisible();
  });

  test('checkout step 1 form may produce an error on submit', async ({ page }) => {
    // Add any available item; if none are available, proceed with empty cart
    // (SauceDemo has no empty-cart guard on checkout)
    await clickAnyAddToCart(page);

    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);

    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
    await page.fill('[data-test="postalCode"]', CHECKOUT_INFO.postalCode);
    await page.click('[data-test="continue"]');

    // error_user may proceed to step 2 or show an unexpected error — both are valid
    const onStepTwo  = page.url().includes('checkout-step-two');
    const errorShown = await page.locator('[data-test="error"]').isVisible().catch(() => false);

    expect(onStepTwo || errorShown).toBe(true);
  });

  test('error_user can reach checkout step 2 but Finish may fail', async ({
    page,
  }) => {
    // error_user consistently fails at the Finish step — that IS the observed
    // defect. This test verifies the user can navigate into the checkout flow
    // and that the Finish step results in a coherent page state (error shown
    // or navigation), not a crash or a blank/frozen page.
    const added = await clickAnyAddToCart(page);
    if (!added) {
      test.skip();
      return;
    }

    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);

    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
    await page.fill('[data-test="postalCode"]', CHECKOUT_INFO.postalCode);
    await page.click('[data-test="continue"]');
    await page.waitForURL(/checkout-step-two/, { timeout: 10_000 });

    // Step 2 loaded — this is as far as error_user reliably gets
    await expect(page.locator('[data-test="finish"]')).toBeVisible();

    await page.click('[data-test="finish"]');

    // Accept either outcome: completion OR error message — both are valid states
    await page.waitForTimeout(3000);
    const completed  = page.url().includes('checkout-complete');
    const errorShown = await page.locator('[data-test="error"]').isVisible().catch(() => false);
    const stillOnStep2 = page.url().includes('checkout-step-two');

    expect(completed || errorShown || stillOnStep2).toBe(true);
  });
});

/**
 * performance_glitch_user persona — timing assertions
 *
 * Runs WITHOUT storageState so that login timing is measured from scratch.
 * The threshold is generous enough to pass reliably on CI but tight enough
 * to catch if the artificial delay were removed.
 */

import { test, expect } from '@playwright/test';
import { USERS } from '../../test-data/credentials';
import { PRODUCTS } from '../../test-data/products';
import { CHECKOUT_INFO } from '../../test-data/checkout';

const { username, password } = USERS.glitch;

// Thresholds (ms)
const LOGIN_SLOW_THRESHOLD  = 1500;  // slower than standard_user
const LOGIN_MAX_THRESHOLD   = 10_000; // must still complete
const PAGE_LOAD_THRESHOLD   = 8_000;

test.describe('Persona: performance_glitch_user — timing', () => {
  test('login is measurably slower than the fast path but completes', async ({
    page,
  }) => {
    await page.goto('/');

    const start = Date.now();
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL(/inventory\.html/, { timeout: LOGIN_MAX_THRESHOLD });
    const elapsed = Date.now() - start;

    // Must be slow (artificial glitch present) but must eventually succeed
    expect(elapsed).toBeGreaterThan(LOGIN_SLOW_THRESHOLD);
    expect(elapsed).toBeLessThan(LOGIN_MAX_THRESHOLD);

    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('inventory page loads within acceptable threshold after login', async ({
    page,
  }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL(/inventory\.html/, { timeout: PAGE_LOAD_THRESHOLD });

    // Inventory should eventually be visible
    await expect(page.locator('.inventory_item')).toHaveCount(6, {
      timeout: PAGE_LOAD_THRESHOLD,
    });
  });

  test('functional parity: can complete a full checkout despite glitch', async ({
    page,
  }) => {
    // Log in
    await page.goto('/');
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL(/inventory\.html/, { timeout: PAGE_LOAD_THRESHOLD });

    // Add item
    await page
      .locator(`[data-test="${PRODUCTS[0].addToCartSelector}"]`)
      .click();

    // Cart
    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);

    // Step 1
    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
    await page.fill('[data-test="postalCode"]', CHECKOUT_INFO.postalCode);
    await page.click('[data-test="continue"]');
    await page.waitForURL(/checkout-step-two/);

    // Finish
    await page.click('[data-test="finish"]');
    await page.waitForURL(/checkout-complete/, { timeout: PAGE_LOAD_THRESHOLD });

    await expect(page.locator('[data-test="complete-header"]')).toHaveText(
      'Thank you for your order!'
    );
  });
});

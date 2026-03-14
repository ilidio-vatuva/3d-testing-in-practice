/**
 * Base fixture
 *
 * Extends the built-in Playwright `test` with helper actions used across
 * multiple test files. Authentication is handled by storageState in
 * playwright.config.ts — no login logic here.
 */

import { test as base, Page } from '@playwright/test';
import { CHECKOUT_INFO } from '../../test-data/checkout';
import { PRODUCTS } from '../../test-data/products';

export type Helpers = {
  addFirstItemToCart: () => Promise<void>;
  addAllItemsToCart: () => Promise<void>;
  proceedToCheckoutStep2: () => Promise<void>;
};

export const test = base.extend<{ helpers: Helpers }>({
  helpers: async ({ page }, use) => {
    const helpers: Helpers = {
      async addFirstItemToCart() {
        await page.goto('/inventory.html');
        await page
          .locator(`[data-test="${PRODUCTS[0].addToCartSelector}"]`)
          .click();
      },

      async addAllItemsToCart() {
        await page.goto('/inventory.html');
        for (const product of PRODUCTS) {
          await page
            .locator(`[data-test="${product.addToCartSelector}"]`)
            .click();
        }
      },

      async proceedToCheckoutStep2() {
        await helpers.addFirstItemToCart();
        await page.goto('/cart.html');
        await page.click('[data-test="checkout"]');
        await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
        await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
        await page.fill('[data-test="postalCode"]', CHECKOUT_INFO.postalCode);
        await page.click('[data-test="continue"]');
        await page.waitForURL(/checkout-step-two/);
      },
    };

    await use(helpers);
  },
});

export { expect } from '@playwright/test';

/** Extracts a dollar amount from a string like "$29.99" → 29.99 */
export function parseDollar(text: string): number {
  return parseFloat(text.replace(/[^0-9.]/g, ''));
}

/** Logs in via UI — use only in tests that need to measure or test auth itself. */
export async function loginAs(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto('/');
  await page.fill('[data-test="username"]', username);
  await page.fill('[data-test="password"]', password);
  await page.click('[data-test="login-button"]');
}

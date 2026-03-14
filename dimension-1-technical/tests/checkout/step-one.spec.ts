import { test, expect } from '../fixtures/base.fixture';
import { CHECKOUT_INFO } from '../../test-data/checkout';

test.describe('Checkout — Step 1 (Your Information)', () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.addFirstItemToCart();
    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    await page.waitForURL(/checkout-step-one/);
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  test('empty form shows First Name required error', async ({ page }) => {
    await page.click('[data-test="continue"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'First Name is required'
    );
  });

  test('missing Last Name shows Last Name required error', async ({ page }) => {
    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.click('[data-test="continue"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Last Name is required'
    );
  });

  test('missing Postal Code shows Postal Code required error', async ({ page }) => {
    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
    await page.click('[data-test="continue"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Postal Code is required'
    );
  });

  test('valid form proceeds to step 2 @smoke', async ({ page }) => {
    await page.fill('[data-test="firstName"]', CHECKOUT_INFO.firstName);
    await page.fill('[data-test="lastName"]',  CHECKOUT_INFO.lastName);
    await page.fill('[data-test="postalCode"]', CHECKOUT_INFO.postalCode);
    await page.click('[data-test="continue"]');

    await expect(page).toHaveURL(/checkout-step-two/);
  });

  test('Cancel returns to cart', async ({ page }) => {
    await page.click('[data-test="cancel"]');

    await expect(page).toHaveURL(/cart\.html/);
  });

  test('error dismiss button clears the validation message', async ({ page }) => {
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    await page.locator('[data-test="error"] button').click();

    await expect(page.locator('[data-test="error"]')).not.toBeVisible();
  });
});

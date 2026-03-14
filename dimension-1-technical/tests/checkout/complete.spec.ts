import { test, expect } from '../fixtures/base.fixture';

test.describe('Checkout — Complete', () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.proceedToCheckoutStep2();
    await page.click('[data-test="finish"]');
    await page.waitForURL(/checkout-complete/);
  });

  test('shows Thank you confirmation header @smoke', async ({ page }) => {
    await expect(page.locator('[data-test="complete-header"]')).toHaveText(
      'Thank you for your order!'
    );
  });

  test('shows pony dispatch subtext', async ({ page }) => {
    await expect(page.locator('[data-test="complete-text"]')).toContainText(
      'Your order has been dispatched'
    );
  });

  test('cart badge is gone after order completes', async ({ page }) => {
    await expect(
      page.locator('[data-test="shopping-cart-badge"]')
    ).not.toBeVisible();
  });

  test('Back Home button returns to inventory', async ({ page }) => {
    await page.click('[data-test="back-to-products"]');

    await expect(page).toHaveURL(/inventory\.html/);
  });
});

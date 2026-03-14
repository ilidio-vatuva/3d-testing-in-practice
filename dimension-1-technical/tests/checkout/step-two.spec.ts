import { test, expect, parseDollar } from '../fixtures/base.fixture';
import { PRODUCTS } from '../../test-data/products';

test.describe('Checkout — Step 2 (Overview)', () => {
  test.beforeEach(async ({ page, helpers }) => {
    await helpers.proceedToCheckoutStep2();
  });

  test('displays all ordered items', async ({ page }) => {
    const item = page.locator('.cart_item');
    await expect(item).toHaveCount(1);
    await expect(item.locator('.inventory_item_name')).toHaveText(PRODUCTS[0].name);
  });

  test('math: item total + tax = grand total', async ({ page }) => {
    const itemTotalText = await page
      .locator('[data-test="subtotal-label"]')
      .textContent();
    const taxText = await page
      .locator('[data-test="tax-label"]')
      .textContent();
    const totalText = await page
      .locator('[data-test="total-label"]')
      .textContent();

    const itemTotal = parseDollar(itemTotalText!);
    const tax       = parseDollar(taxText!);
    const total     = parseDollar(totalText!);

    expect(itemTotal + tax).toBeCloseTo(total, 2);
  });

  test('item total matches the price of the added product', async ({ page }) => {
    const itemTotalText = await page
      .locator('[data-test="subtotal-label"]')
      .textContent();
    const itemTotal = parseDollar(itemTotalText!);

    expect(itemTotal).toBeCloseTo(PRODUCTS[0].price, 2);
  });

  test('Cancel navigates to inventory (not cart)', async ({ page }) => {
    await page.click('[data-test="cancel"]');

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('Finish navigates to checkout-complete', async ({ page }) => {
    await page.click('[data-test="finish"]');

    await expect(page).toHaveURL(/checkout-complete/);
  });
});

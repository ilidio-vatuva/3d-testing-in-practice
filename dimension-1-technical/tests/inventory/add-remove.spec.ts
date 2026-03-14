import { test, expect } from '../fixtures/base.fixture';
import { PRODUCTS } from '../../test-data/products';

test.describe('Inventory — add to cart / remove', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('adding one item updates button text and shows badge = 1', async ({ page }) => {
    const product = PRODUCTS[0];
    await page.click(`[data-test="${product.addToCartSelector}"]`);

    await expect(
      page.locator(`[data-test="${product.removeSelector}"]`)
    ).toContainText('Remove');
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('adding all 6 items shows badge = 6', async ({ page }) => {
    for (const product of PRODUCTS) {
      await page.click(`[data-test="${product.addToCartSelector}"]`);
    }
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('6');
  });

  test('removing an item decrements badge and reverts button to Add to cart', async ({ page }) => {
    const product = PRODUCTS[0];
    await page.click(`[data-test="${product.addToCartSelector}"]`);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

    await page.click(`[data-test="${product.removeSelector}"]`);

    await expect(
      page.locator(`[data-test="${product.addToCartSelector}"]`)
    ).toBeVisible();
    await expect(
      page.locator('[data-test="shopping-cart-badge"]')
    ).not.toBeVisible();
  });

  test('clicking product name navigates to its detail page', async ({ page }) => {
    const product = PRODUCTS[0];
    await page.locator('.inventory_item_name').filter({ hasText: product.name }).click();

    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toHaveText(product.name);
  });

  test('clicking product image navigates to its detail page', async ({ page }) => {
    const firstImage = page.locator('.inventory_item img').first();
    await firstImage.click();

    await expect(page).toHaveURL(/inventory-item\.html/);
  });
});

import { test, expect } from '../fixtures/base.fixture';
import { PRODUCTS } from '../../test-data/products';

test.describe('Inventory — display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('renders exactly 6 products @smoke', async ({ page }) => {
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('each product shows name, description, price, and Add to Cart button', async ({ page }) => {
    const items = page.locator('.inventory_item');

    for (let i = 0; i < 6; i++) {
      const item = items.nth(i);
      await expect(item.locator('.inventory_item_name')).not.toBeEmpty();
      await expect(item.locator('.inventory_item_desc')).not.toBeEmpty();
      await expect(item.locator('.inventory_item_price')).toContainText('$');
      await expect(item.locator('button')).toContainText('Add to cart');
    }
  });

  test('each product has a visible image', async ({ page }) => {
    const images = page.locator('.inventory_item img');
    const count = await images.count();
    expect(count).toBe(6);

    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toBeVisible();
      const src = await images.nth(i).getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('cart badge is not visible on first load', async ({ page }) => {
    await expect(page.locator('[data-test="shopping-cart-badge"]')).not.toBeVisible();
  });

  test('all known products are present', async ({ page }) => {
    const names = await page.locator('.inventory_item_name').allTextContents();
    for (const product of PRODUCTS) {
      expect(names).toContain(product.name);
    }
  });
});

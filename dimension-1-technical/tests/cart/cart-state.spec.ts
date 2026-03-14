import { test, expect } from '../fixtures/base.fixture';
import { PRODUCTS } from '../../test-data/products';

test.describe('Cart — state', () => {
  test('items added from inventory appear in cart with correct details @smoke', async ({
    page,
    helpers,
  }) => {
    await helpers.addFirstItemToCart();
    await page.goto('/cart.html');

    const cartItem = page.locator('.cart_item');
    await expect(cartItem).toHaveCount(1);
    await expect(cartItem.locator('.inventory_item_name')).toHaveText(PRODUCTS[0].name);
    await expect(cartItem.locator('.inventory_item_price')).toHaveText(
      `$${PRODUCTS[0].price.toFixed(2)}`
    );
    await expect(cartItem.locator('.cart_quantity')).toHaveText('1');
  });

  test('removing an item from cart removes it from the list', async ({
    page,
    helpers,
  }) => {
    await helpers.addFirstItemToCart();
    await page.goto('/cart.html');

    await page.click(`[data-test="${PRODUCTS[0].removeSelector}"]`);

    await expect(page.locator('.cart_item')).toHaveCount(0);
    await expect(
      page.locator('[data-test="shopping-cart-badge"]')
    ).not.toBeVisible();
  });

  test('Continue Shopping returns to inventory with cart intact', async ({
    page,
    helpers,
  }) => {
    await helpers.addFirstItemToCart();
    await page.goto('/cart.html');
    await page.click('[data-test="continue-shopping"]');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
  });

  test('cart persists after page refresh', async ({ page, helpers }) => {
    await helpers.addFirstItemToCart();
    await page.goto('/cart.html');
    await page.reload();

    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  test('Reset App State clears cart and resets Add to Cart buttons', async ({
    page,
    helpers,
  }) => {
    await helpers.addAllItemsToCart();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('6');

    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="reset-sidebar-link"]');
    await page.keyboard.press('Escape'); // close the menu

    // Cart count clears immediately in the header
    await expect(
      page.locator('[data-test="shopping-cart-badge"]')
    ).not.toBeVisible();

    // SauceDemo re-renders button state on next navigation — navigate to
    // inventory to verify the reset persists and all Add to Cart buttons return
    await page.goto('/inventory.html');
    await expect(page.locator('[data-test^="add-to-cart-"]')).toHaveCount(6);
  });

  test('empty cart checkout gate — proceeds to step 1 without guard', async ({
    page,
  }) => {
    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
    // SauceDemo has no guard on an empty cart — this is documented behaviour
    await expect(page).toHaveURL(/checkout-step-one/);
  });
});

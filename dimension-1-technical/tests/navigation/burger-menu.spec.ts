import { test, expect } from '../fixtures/base.fixture';

test.describe('Burger menu navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('All Items navigates to inventory', async ({ page }) => {
    // Navigate away first so the link has observable effect
    await page.goto('/cart.html');
    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="inventory-sidebar-link"]');

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('About link navigates to saucelabs.com', async ({ page, context }) => {
    await page.click('#react-burger-menu-btn');

    // About opens in same tab or new tab depending on browser/config.
    // Race: accept whichever happens first within 5s.
    const newTabPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
    await page.click('[data-test="about-sidebar-link"]');
    const newTab = await newTabPromise;

    const targetPage = newTab ?? page;
    await targetPage.waitForLoadState('domcontentloaded');
    expect(targetPage.url()).toContain('saucelabs.com');
  });

  test('Logout redirects to login and clears session', async ({ page }) => {
    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="logout-sidebar-link"]');

    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('Reset App State clears the cart without a page reload', async ({
    page,
    helpers,
  }) => {
    await helpers.addAllItemsToCart();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('6');

    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="reset-sidebar-link"]');

    // Sidebar stays open; close it and verify state
    await page.keyboard.press('Escape');
    await expect(
      page.locator('[data-test="shopping-cart-badge"]')
    ).not.toBeVisible();
  });
});

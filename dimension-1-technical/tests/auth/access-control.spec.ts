/**
 * Access-control tests
 *
 * These tests intentionally run WITHOUT a storageState (auth-tests project).
 * They verify that protected routes redirect unauthenticated users to the
 * login page and that session invalidation works correctly after logout.
 */

import { test, expect } from '@playwright/test';
import { USERS } from '../../test-data/credentials';

const PROTECTED_ROUTES = [
  '/inventory.html',
  '/cart.html',
  '/checkout-step-one.html',
  '/checkout-step-two.html',
  '/checkout-complete.html',
];

test.describe('Access control — unauthenticated', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`direct navigation to ${route} redirects to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/saucedemo\.com\/?$/);
      await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    });
  }
});

test.describe('Access control — post-logout', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first so we have a valid session to then invalidate
    await page.goto('/');
    await page.fill('[data-test="username"]', USERS.standard.username);
    await page.fill('[data-test="password"]', USERS.standard.password);
    await page.click('[data-test="login-button"]');
    await page.waitForURL(/inventory\.html/);
  });

  test('logout redirects to login page', async ({ page }) => {
    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="logout-sidebar-link"]');

    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('back button after logout does not restore protected page', async ({ page }) => {
    await page.click('#react-burger-menu-btn');
    await page.click('[data-test="logout-sidebar-link"]');
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);

    await page.goBack();

    // Should still be on login (or redirect back to login)
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});

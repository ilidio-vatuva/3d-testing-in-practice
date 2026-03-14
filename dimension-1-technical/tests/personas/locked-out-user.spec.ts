/**
 * locked_out_user persona
 *
 * This user cannot authenticate. All tests run from the login page with no
 * storageState — they verify that the lock is enforced at every entry point.
 */

import { test, expect } from '@playwright/test';
import { USERS } from '../../test-data/credentials';

const { username, password } = USERS.locked;

test.describe('Persona: locked_out_user', () => {
  test('login shows the locked-out error message', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Sorry, this user has been locked out'
    );
  });

  test('login does not navigate away from the login page', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');

    await expect(page).not.toHaveURL(/inventory/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('direct navigation to inventory redirects to login', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
  });
});

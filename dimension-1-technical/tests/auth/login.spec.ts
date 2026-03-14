import { test, expect } from '@playwright/test';
import { USERS } from '../../test-data/credentials';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  test('standard_user logs in and lands on inventory @smoke', async ({ page }) => {
    await page.fill('[data-test="username"]', USERS.standard.username);
    await page.fill('[data-test="password"]', USERS.standard.password);
    await page.click('[data-test="login-button"]');

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  // ── Validation errors ───────────────────────────────────────────────────────

  test('empty username shows required error', async ({ page }) => {
    await page.fill('[data-test="password"]', USERS.standard.password);
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username is required'
    );
  });

  test('empty password shows required error', async ({ page }) => {
    await page.fill('[data-test="username"]', USERS.standard.username);
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Password is required'
    );
  });

  test('wrong credentials show mismatch error', async ({ page }) => {
    await page.fill('[data-test="username"]', 'wrong_user');
    await page.fill('[data-test="password"]', 'wrong_pass');
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('locked_out_user sees locked error', async ({ page }) => {
    await page.fill('[data-test="username"]', USERS.locked.username);
    await page.fill('[data-test="password"]', USERS.locked.password);
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Sorry, this user has been locked out'
    );
    await expect(page).not.toHaveURL(/inventory/);
  });

  // ── Error UI behaviour ──────────────────────────────────────────────────────

  test('error dismiss button clears the message', async ({ page }) => {
    await page.click('[data-test="login-button"]');
    await expect(page.locator('[data-test="error"]')).toBeVisible();

    await page.locator('[data-test="error"] button').click();

    await expect(page.locator('[data-test="error"]')).not.toBeVisible();
  });

  test('error fields receive error-highlight class', async ({ page }) => {
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="username"]')).toHaveClass(
      /error/
    );
    await expect(page.locator('[data-test="password"]')).toHaveClass(
      /error/
    );
  });
});

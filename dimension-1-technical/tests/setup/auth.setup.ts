/**
 * Auth Setup
 *
 * Logs in as each persona that can successfully authenticate and saves their
 * browser storageState to playwright/.auth/<key>.json. The test projects for
 * those personas declare a dependency on this setup project, so these files
 * are always fresh before the main suite runs.
 *
 * locked_out_user is intentionally excluded — their login always fails.
 * performance_glitch_user is excluded — their project measures actual login
 * timing and therefore cannot start from a pre-authenticated state.
 */

import { test as setup, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { USERS } from '../../test-data/credentials';

const authDir = path.join(__dirname, '../../playwright/.auth');
fs.mkdirSync(authDir, { recursive: true });

async function authenticate(
  page: Page,
  username: string,
  password: string,
  outFile: string
) {
  await page.goto('/');
  await page.fill('[data-test="username"]', username);
  await page.fill('[data-test="password"]', password);
  await page.click('[data-test="login-button"]');
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: outFile });
}

setup('authenticate standard_user', async ({ page }) => {
  await authenticate(
    page,
    USERS.standard.username,
    USERS.standard.password,
    path.join(authDir, 'standard.json')
  );
});

setup('authenticate problem_user', async ({ page }) => {
  await authenticate(
    page,
    USERS.problem.username,
    USERS.problem.password,
    path.join(authDir, 'problem.json')
  );
});

setup('authenticate error_user', async ({ page }) => {
  await authenticate(
    page,
    USERS.error.username,
    USERS.error.password,
    path.join(authDir, 'error.json')
  );
});

setup('authenticate visual_user', async ({ page }) => {
  await authenticate(
    page,
    USERS.visual.username,
    USERS.visual.password,
    path.join(authDir, 'visual.json')
  );
});

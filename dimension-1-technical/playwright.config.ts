import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const authDir = path.join(__dirname, 'playwright/.auth');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: [
    ['html'],
    ...(process.env.CI ? ([['github']] as ['github'][]) : []),
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // ── Auth setup ────────────────────────────────────────────────────────────
    // Runs first; generates a storageState JSON per persona that can log in.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ── Standard user — full functional suite ─────────────────────────────────
    {
      name: 'standard-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'standard.json'),
      },
      dependencies: ['setup'],
      testIgnore: [
        '**/auth/login.spec.ts',
        '**/auth/access-control.spec.ts',
        '**/personas/**',
      ],
    },

    // ── Auth tests — unauthenticated by design ────────────────────────────────
    {
      name: 'auth-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        '**/auth/login.spec.ts',
        '**/auth/access-control.spec.ts',
      ],
    },

    // ── Persona: locked_out_user ──────────────────────────────────────────────
    // No storageState — the whole point is that login fails.
    {
      name: 'locked-out-user',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/personas/locked-out-user.spec.ts',
    },

    // ── Persona: problem_user ─────────────────────────────────────────────────
    {
      name: 'problem-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'problem.json'),
      },
      dependencies: ['setup'],
      testMatch: '**/personas/problem-user.spec.ts',
    },

    // ── Persona: performance_glitch_user ──────────────────────────────────────
    // No storageState — we measure the actual login round-trip time.
    {
      name: 'performance-glitch-user',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/personas/performance-glitch-user.spec.ts',
    },

    // ── Persona: error_user ───────────────────────────────────────────────────
    {
      name: 'error-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'error.json'),
      },
      dependencies: ['setup'],
      testMatch: '**/personas/error-user.spec.ts',
    },

    // ── Persona: visual_user ──────────────────────────────────────────────────
    {
      name: 'visual-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'visual.json'),
      },
      dependencies: ['setup'],
      testMatch: '**/personas/visual-user.spec.ts',
    },

    // ── Smoke — fast PR gate (standard_user, key flows only) ──────────────────
    {
      name: 'smoke',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'standard.json'),
      },
      dependencies: ['setup'],
      grep: /@smoke/,
    },
  ],
});

# Technical Test Strategy — Swag Labs (SauceDemo)

> **Application:** https://www.saucedemo.com
> **Type:** React SPA (client-side only, no public backend API)
> **Purpose:** Demo e-commerce app by Sauce Labs for QA practice
> **Dimension:** Technical — functional flows, state behavior, automation, and CI/CD

---

## 1. Application Architecture (Observable)

SauceDemo is a fully client-side React single-page application. Key technical characteristics visible through the browser:

- **No XHR/fetch calls** — all product data, user credentials, and cart state are embedded in the JavaScript bundle
- **Session state** lives in browser `sessionStorage` — clearing it forces re-authentication
- **Cart state** persists across page refreshes (localStorage or sessionStorage key: `cart-contents`)
- **Routing** is path-based (`.html` extensions), not hash-based — direct URL access to protected routes redirects to login
- **6 test user personas** hardcoded with deliberate behavioral defects per user (see §3)
- **No REST API to mock** — no network stubbing is needed; all behavior is synchronous and in-bundle

---

## 2. Test Scope

### In Scope

| Area | Coverage |
|---|---|
| Authentication flows | Login, logout, error states, access control |
| Product catalog | Display, sorting, navigation to detail |
| Cart management | Add, remove, persist, reset |
| Checkout flow | 3-step form, validation, confirmation |
| User persona behavior | Defect verification across all 6 personas |
| Navigation & routing | Burger menu, back-navigation, direct URL access |
| State management | Session persistence, cart reset, post-logout state |

### Out of Scope

- Network/API layer (none exists)
- Backend database or server-side logic
- Payment gateway (not implemented)
- Email/notification delivery
- Mobile native apps

---

## 3. Functional Flow Coverage

### 3.1 Authentication

**Happy path**

```
Login page → enter standard_user / secret_sauce → submit → land on /inventory.html
```

**Negative paths**

| Scenario | Input | Expected Error |
|---|---|---|
| Empty username | (blank) / secret_sauce | "Epic sadface: Username is required" |
| Empty password | standard_user / (blank) | "Epic sadface: Password is required" |
| Wrong credentials | foo / bar | "Epic sadface: Username and password do not match any user in this service" |
| Locked user | locked_out_user / secret_sauce | "Epic sadface: Sorry, this user has been locked out." |

**Access control**

- Direct navigation to `/inventory.html`, `/cart.html`, or `/checkout-step-one.html` without a session must redirect to `/`
- After logout, the back button must not restore a protected page (session invalidation)

**Error message UI**

- Error container must be visible (`[data-test="error"]`)
- The ✕ dismiss button must close the error without page reload
- Fields must receive an error highlight class on validation failure

---

### 3.2 Product Inventory

**Display**

- Exactly 6 products rendered, each with: image, name, description, price, Add to Cart button
- Cart badge is absent (or shows 0) on first load

**Sorting — 4 options to verify**

| Option | Validation Method |
|---|---|
| Name (A→Z) | Assert product names in ascending alphabetical order |
| Name (Z→A) | Assert product names in descending alphabetical order |
| Price (low→high) | Extract price values, assert ascending numeric sort |
| Price (high→low) | Extract price values, assert descending numeric sort |

**Add to cart from inventory**

1. Click "Add to Cart" on a product
2. Button text changes to "Remove"
3. Header cart badge increments to 1
4. Repeat for all 6; badge should read 6

**Remove from inventory**

1. After adding, click "Remove"
2. Button reverts to "Add to Cart"
3. Cart badge decrements

**Product navigation**

- Clicking product name navigates to `/inventory-item.html?id=N`
- Clicking product image navigates to the same detail page
- Correct product is displayed (name, description, price, image match)

---

### 3.3 Product Detail Page

- "Back to products" returns to `/inventory.html` with cart state preserved
- "Add to cart" / "Remove" toggles correctly
- Cart badge reflects the change on the detail page
- All 6 products accessible via `?id=0` through `?id=5`

---

### 3.4 Shopping Cart

**State verification**

- Items added on inventory or detail pages appear in cart with correct name, description, qty (always 1), and price
- Removing an item from cart removes it from the list and decrements the badge
- "Continue Shopping" returns to `/inventory.html`; previously-added items remain in cart
- Cart is empty after "Reset App State" from burger menu

**Checkout gate**

- Clicking "Checkout" with an empty cart still proceeds to step 1 (no guard — this is an observable behavior to document)

---

### 3.5 Checkout — Step 1 (Your Information)

**Validation**

| Scenario | Expected |
|---|---|
| Submit all empty | "Error: First Name is required" |
| Submit with only first name | "Error: Last Name is required" |
| Submit with first + last, no zip | "Error: Postal Code is required" |
| All fields filled | Proceeds to `/checkout-step-two.html` |

- Cancel returns to `/cart.html`
- Error dismissal (✕ button) clears the error state

---

### 3.6 Checkout — Step 2 (Overview)

- All cart items are listed with correct names, quantities, prices
- Item total = sum of all item prices
- Tax is calculated and displayed (observable value, not hardcoded assertion)
- Grand total = item total + tax
- "Cancel" navigates to `/inventory.html` (not back to cart)
- "Finish" navigates to `/checkout-complete.html`

---

### 3.7 Checkout Complete

- Confirmation header: "Thank you for your order!"
- Pony dispatch subtext is present
- "Back Home" returns to `/inventory.html`
- Cart badge is gone (cart cleared after order completion)
- Re-navigating directly to `/checkout-complete.html` after completion should show the page (no guard observed)

---

### 3.8 Burger Menu (Sidebar Navigation)

Available on all authenticated pages. Test from each page:

| Link | Expected Behavior |
|---|---|
| All Items | Navigates to `/inventory.html` |
| About | Opens `https://saucelabs.com` (assert URL change or new tab) |
| Logout | Clears session, redirects to `/` |
| Reset App State | Clears cart items and resets all "Add to Cart" buttons to default state, no page reload |

---

### 3.9 User Persona Defect Verification

Each persona must be tested to confirm intentional defects are present. These are **negative happy-path** tests — they pass when the bug is confirmed.

#### `locked_out_user`
- [ ] Login returns the locked-out error message
- [ ] No access to any protected route

#### `problem_user`
- [ ] All 6 inventory images are the same wrong image
- [ ] Sort dropdown does not reorder products when changed
- [ ] "Add to cart" fails for at least some products
- [ ] "Remove" button does not work from inventory
- [ ] Product links navigate to wrong or broken detail pages
- [ ] Last Name field in checkout step 1 overwrites First Name; accepts only 1 character
- [ ] Checkout cannot be completed

#### `performance_glitch_user`
- [ ] Login takes noticeably longer than `standard_user` (measurable via `performance.now()` or timing assertion with threshold)
- [ ] Page transitions are delayed (1–5 seconds observable)
- [ ] Checkout can be completed — functional parity with `standard_user` otherwise

#### `error_user`
- [ ] At least one of: "Add to Cart", checkout step 1 submission, or checkout step 2 finalization produces an error message
- [ ] Behavior is non-deterministic — tests should assert that errors *can* occur, not that they *always* do (retry-based assertion or run multiple iterations)

#### `visual_user`
- [ ] Functional flows complete successfully (login → checkout)
- [ ] Visual snapshot differs from `standard_user` baseline (layout/style defects present)
- [ ] Used exclusively as the subject for visual regression tests (Percy, Applitools, or Playwright screenshot diff)

---

## 4. State & Session Behavior

These are cross-cutting concerns tested independently of specific pages:

| Scenario | Expected |
|---|---|
| Refresh on `/inventory.html` | Session persists; products still visible |
| Refresh on `/cart.html` | Cart contents preserved |
| Refresh mid-checkout (step 1) | Form fields cleared; session preserved |
| Open protected URL in incognito | Redirected to login |
| Logout then back-button | Protected page should not be accessible (session gone) |
| Two browser tabs, logout in one | Other tab on next action should redirect to login |
| Add items, "Reset App State", check cart | Cart is empty; all "Add to Cart" buttons reset |

---

## 5. API / Network Layer

SauceDemo has **no observable backend API**. All behavior is embedded in the React bundle:

- No `fetch()` or `XMLHttpRequest` calls are made during normal use
- User credentials are validated client-side (the bundle contains the valid username list)
- Product data is hardcoded in the component tree
- Cart state is managed via React context + browser storage

**Implication for test strategy:** No network interception or API mocking is needed. Test state is established entirely through UI actions or direct `sessionStorage`/`localStorage` manipulation via `page.evaluate()`.

**Performance timing** (relevant for `performance_glitch_user`):
- Use `page.evaluate(() => performance.timing)` or `performance.now()` wrappers to assert that login completes within acceptable thresholds per user type

---

## 6. Automation Framework Recommendation

### Primary: Playwright (TypeScript)

**Rationale:**

| Factor | Justification |
|---|---|
| SPA rendering | Playwright's auto-wait handles React's async rendering without explicit waits |
| Cross-browser | Chromium, Firefox, WebKit from one test run |
| Built-in tracing | `playwright trace` provides step-by-step screenshots + network on failure |
| Visual testing | Built-in `toHaveScreenshot()` for `visual_user` persona tests |
| Storage state | `storageState` API allows pre-authenticated test setup without repeating login |
| Parallelism | Native worker-based parallelism; each persona can run in an isolated project |
| No extra dependencies | Assertions, reporting, and retry logic are all built-in |

**Project structure**

```
tests/
  auth/
    login.spec.ts           # All authentication scenarios
    access-control.spec.ts  # Direct URL access without session
  inventory/
    display.spec.ts
    sorting.spec.ts
    add-remove.spec.ts
  cart/
    cart-state.spec.ts
  checkout/
    step-one.spec.ts
    step-two.spec.ts
    complete.spec.ts
  navigation/
    burger-menu.spec.ts
  personas/
    locked-out-user.spec.ts
    problem-user.spec.ts
    performance-glitch-user.spec.ts
    error-user.spec.ts
    visual-user.spec.ts
  fixtures/
    auth.fixture.ts         # storageState factory per user
playwright.config.ts
```

**Auth fixture pattern** (avoid repeating login in every test)

```typescript
// fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';

type AuthFixture = { authenticatedPage: Page };

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await page.waitForURL('**/inventory.html');
    await use(page);
  },
});
```

**storageState for fast parallel setup**

```typescript
// playwright.config.ts — use saved auth state per persona
projects: [
  {
    name: 'standard_user',
    use: { storageState: 'playwright/.auth/standard_user.json' },
    testMatch: 'tests/**/*.spec.ts',
    testIgnore: 'tests/personas/**',
  },
  {
    name: 'problem_user',
    use: { storageState: 'playwright/.auth/problem_user.json' },
    testMatch: 'tests/personas/problem-user.spec.ts',
  },
  // ... repeat per persona
],
```

**Selector strategy** — prefer `data-test` attributes (all key elements in SauceDemo have them):

```typescript
// Use data-test attributes for resilience
page.locator('[data-test="username"]')
page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')
page.locator('[data-test="cart-badge"]')
page.locator('[data-test="checkout"]')
page.locator('[data-test="error"]')
```

**Sorting test pattern** (data-driven, not screenshot-based)

```typescript
test('sort by price low to high', async ({ page }) => {
  await page.selectOption('[data-test="product-sort-container"]', 'lohi');
  const prices = await page.locator('.inventory_item_price').allTextContents();
  const nums = prices.map(p => parseFloat(p.replace('$', '')));
  expect(nums).toEqual([...nums].sort((a, b) => a - b));
});
```

**Performance assertion for performance_glitch_user**

```typescript
test('login completes within 7 seconds', async ({ page }) => {
  const start = Date.now();
  await page.fill('[data-test="username"]', 'performance_glitch_user');
  await page.fill('[data-test="password"]', 'secret_sauce');
  await page.click('[data-test="login-button"]');
  await page.waitForURL('**/inventory.html');
  expect(Date.now() - start).toBeLessThan(7000);
});
```

### Secondary Tooling

| Tool | Role |
|---|---|
| **Playwright** (visual) | `toHaveScreenshot()` for `visual_user` baseline vs. diff |
| **Axe-core** (via `@axe-core/playwright`) | Accessibility checks on each page as part of the standard_user flow |
| **ESLint + TypeScript** | Static analysis of test code itself |

---

## 7. Test Data Strategy

No external data fixtures are needed — the app is fully self-contained.

| Data Type | Source |
|---|---|
| User credentials | Hardcoded constants in a `credentials.ts` file |
| Product catalog | Assert against known values (6 products, known prices) |
| Cart contents | Driven by UI actions within the test |
| Checkout form data | Parameterized test data (name, zip) in test or fixtures |

```typescript
// test-data/credentials.ts
export const USERS = {
  standard:    { username: 'standard_user',          password: 'secret_sauce' },
  locked:      { username: 'locked_out_user',        password: 'secret_sauce' },
  problem:     { username: 'problem_user',           password: 'secret_sauce' },
  glitch:      { username: 'performance_glitch_user',password: 'secret_sauce' },
  error:       { username: 'error_user',             password: 'secret_sauce' },
  visual:      { username: 'visual_user',            password: 'secret_sauce' },
} as const;
```

---

## 8. CI/CD Integration

### Recommended Pipeline (GitHub Actions)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'  # Daily smoke run at 06:00 UTC

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox webkit

      - name: Generate auth states (all personas)
        run: npx playwright test tests/setup/auth.setup.ts

      - name: Run E2E tests
        run: npx playwright test --reporter=html,github

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────┐
│  PR / Push to main                                      │
│                                                         │
│  1. Install & Cache        (node_modules, browsers)     │
│  2. Auth Setup             (generate storageState.json  │
│                             per persona)                │
│  3. E2E Tests (parallel)                                │
│     ├── standard_user  ── full suite (all pages)        │
│     ├── locked_out_user ─ auth tests only               │
│     ├── problem_user   ── persona defect verification   │
│     ├── glitch_user    ── performance timing tests      │
│     ├── error_user     ── error path tests              │
│     └── visual_user    ── visual regression snapshots   │
│  4. Report Upload          (HTML report as artifact)    │
└─────────────────────────────────────────────────────────┘
```

### Test Execution Strategy

| Suite | Trigger | Workers | Threshold |
|---|---|---|---|
| Full E2E (all personas) | Merge to main, scheduled daily | 4 | 0 failures |
| Smoke (standard_user only) | Every PR | 2 | 0 failures |
| Visual regression | Merge to main | 1 (serial) | 0 diffs vs. baseline |
| Performance persona | Scheduled daily | 1 | Login < 7s |

### Retries & Flakiness Control

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,   // retry twice on CI only
  workers: process.env.CI ? 4 : 1,
  timeout: 30_000,                    // 30s per test
  expect: { timeout: 5_000 },        // 5s for assertions
});
```

`error_user` tests are inherently non-deterministic. Recommended approach: run those tests with `retries: 3` and assert that the error condition appears *at least once* across retries, or use a dedicated loop-until pattern.

---

## 9. Test Coverage Matrix

| Feature | Happy Path | Negative | Persona Defect | Visual |
|---|---|---|---|---|
| Login | standard_user | empty fields, wrong creds, locked | glitch (timing) | visual_user |
| Inventory display | all 6 items shown | — | problem (wrong images) | visual_user |
| Sorting | all 4 options | — | problem (no-op sort) | — |
| Add/Remove from inventory | add all, remove all | — | problem (partial failure) | — |
| Product detail navigation | correct product shown | — | problem (wrong nav) | — |
| Cart state | add, remove, persist | empty cart checkout | — | — |
| Checkout step 1 | valid submission | all field combinations | problem (last name bug) | — |
| Checkout step 2 | correct totals | — | — | — |
| Checkout complete | confirmation shown | — | — | — |
| Burger menu | all 4 links | — | problem (logout may fail) | — |
| Access control | — | direct URL, post-logout back | — | — |
| Session persistence | refresh mid-flow | — | — | — |

---

## 10. Definition of Done

A test suite for this application is considered complete when:

- [ ] All 7 pages have full happy-path coverage under `standard_user`
- [ ] All documented error states have at least one negative test
- [ ] All 6 user persona defects are explicitly verified (not just assumed)
- [ ] Sorting logic is validated programmatically (not by visual inspection)
- [ ] Cart totals and checkout math are asserted numerically
- [ ] Auth fixture pattern is in place — no test repeats the login flow manually
- [ ] CI pipeline runs the full suite on every push to main
- [ ] CI pipeline runs a smoke subset on every PR (under 5 minutes)
- [ ] Flaky tests (`error_user`) are quarantined with retry + non-deterministic assertion
- [ ] Visual baseline snapshots are committed and compared on each CI run
- [ ] Test report artifact is retained per run for post-mortem analysis



# To Run
cd dimension-1-technical

npx playwright install --with-deps chromium

npm test                    # full suite

npm run test:smoke          # PR gate only

npm run test:standard       # standard_user flows only

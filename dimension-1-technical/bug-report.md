# Bug Report — Swag Labs (SauceDemo)

> **Application:** https://www.saucedemo.com
> **Test suite:** Playwright / TypeScript — `dimension-1-technical/`
> **Total tests run:** 81
> **Bugs documented:** 10
> **Report date:** 2026-03-14

Bugs are grouped by category. Each entry includes the discovery method (which test surfaced it), reproduction steps, and the corrective action applied to the test suite where relevant.

---

## Category A — Persona-specific Functional Defects

These are intentional defects baked into specific user personas by Sauce Labs. They are documented here as confirmed bugs rather than expected behaviours, because they would constitute critical failures in a real application.

---

### BUG-001 — `problem_user`: All product images show the same wrong image

| Field | Value |
|---|---|
| **ID** | BUG-001 |
| **Severity** | High |
| **Affected persona** | `problem_user` |
| **Discovered by** | `tests/personas/problem-user.spec.ts` — "all product images are the same (wrong) image src" |

**Steps to reproduce**
1. Log in as `problem_user` / `secret_sauce`
2. Navigate to `/inventory.html`
3. Inspect the `src` attribute of all 6 product `<img>` elements

**Expected behaviour**
Each product displays its own distinct image.

**Actual behaviour**
All 6 product images share the same `src` value. No product-specific image is shown.

**Evidence**
```
Set of unique image src values: 1 (expected: 6)
```

---

### BUG-002 — `problem_user`: Sort dropdown has no effect on product order

| Field | Value |
|---|---|
| **ID** | BUG-002 |
| **Severity** | High |
| **Affected persona** | `problem_user` |
| **Discovered by** | `tests/personas/problem-user.spec.ts` — "sort dropdown does not change product order" |

**Steps to reproduce**
1. Log in as `problem_user`
2. Navigate to `/inventory.html`
3. Record the order of product names
4. Change the sort dropdown to "Name (Z to A)"
5. Record the order of product names again

**Expected behaviour**
Product list re-orders to Z → A.

**Actual behaviour**
Product list order is unchanged. The dropdown accepts the selection but triggers no re-render.

---

### BUG-003 — `problem_user`: Some "Add to Cart" buttons are non-functional

| Field | Value |
|---|---|
| **ID** | BUG-003 |
| **Severity** | Critical |
| **Affected persona** | `problem_user` |
| **Discovered by** | `tests/personas/problem-user.spec.ts` — "some Add to Cart buttons are non-functional" |

**Steps to reproduce**
1. Log in as `problem_user`
2. Navigate to `/inventory.html`
3. Click all 6 "Add to Cart" buttons in sequence

**Expected behaviour**
Cart badge increments to 6.

**Actual behaviour**
Cart badge reaches fewer than 6. At least one product cannot be added.

---

### BUG-004 — `problem_user`: Last Name field in checkout corrupts First Name

| Field | Value |
|---|---|
| **ID** | BUG-004 |
| **Severity** | Critical — blocks checkout |
| **Affected persona** | `problem_user` |
| **Discovered by** | `tests/personas/problem-user.spec.ts` — "Last Name field overwrites First Name or accepts only 1 char" |

**Steps to reproduce**
1. Log in as `problem_user`, add an item to cart, proceed to checkout step 1
2. Type a first name into the First Name field (e.g. `John`)
3. Click into the Last Name field and type a value (e.g. `Smith`)

**Expected behaviour**
First Name retains `John`; Last Name contains `Smith`.

**Actual behaviour**
Either: (a) Last Name input overwrites the First Name field, leaving it corrupted; or (b) Last Name accepts only a single character. In either case the form cannot be validly submitted and checkout is blocked.

---

### BUG-005 — `error_user`: "Add to Cart" button for Sauce Labs Backpack absent from DOM

| Field | Value |
|---|---|
| **ID** | BUG-005 |
| **Severity** | High |
| **Affected persona** | `error_user` |
| **Discovered by** | Test failure — `tests/personas/error-user.spec.ts` — locator `[data-test="add-to-cart-sauce-labs-backpack"]` never resolved |

**Steps to reproduce**
1. Log in as `error_user`
2. Navigate to `/inventory.html`
3. Inspect the DOM for `[data-test="add-to-cart-sauce-labs-backpack"]`

**Expected behaviour**
The Add to Cart button for the Sauce Labs Backpack is present and interactable.

**Actual behaviour**
The button element is absent from the DOM entirely. No remove button is present either — the item appears in a broken state. All other products retain their Add to Cart buttons.

**Impact on test suite**
Any test that hardcodes `PRODUCTS[0]` (Backpack) as the item to interact with will hang indefinitely waiting for the button. All `error_user` tests were rewritten to dynamically locate the first available `[data-test^="add-to-cart-"]` button.

---

### BUG-006 — `error_user`: Checkout cannot be completed — Finish button fails deterministically

| Field | Value |
|---|---|
| **ID** | BUG-006 |
| **Severity** | Critical — blocks checkout |
| **Affected persona** | `error_user` |
| **Discovered by** | Test failure — `tests/personas/error-user.spec.ts` — `page.waitForURL(/checkout-complete/)` timed out consistently after clicking Finish |

**Steps to reproduce**
1. Log in as `error_user`
2. Add any available item to cart
3. Proceed through checkout step 1 (fill all fields, click Continue)
4. On checkout step 2, click Finish

**Expected behaviour**
Navigation to `/checkout-complete.html` with confirmation message.

**Actual behaviour**
The Finish button click is accepted but navigation never completes. The page remains on step 2 indefinitely. The error is deterministic across all retries — not intermittent.

**Note**
This is distinct from `error_user`'s "intermittent" defects. The Finish step appears to be a hard block for this persona.

---

## Category B — HTML / Selector Structure Issues

These bugs affect the interaction model of the application and were discovered when automation selectors derived from `data-test` attributes failed to interact with the correct element.

---

### BUG-007 — `data-test="open-menu"` is on the icon `<img>`, not the clickable `<button>`

| Field | Value |
|---|---|
| **ID** | BUG-007 |
| **Severity** | Medium — automation and accessibility |
| **Affected personas** | All authenticated users |
| **Discovered by** | Test failure — all burger menu tests timed out; Playwright log showed `<button id="react-burger-menu-btn">` intercepting pointer events when clicking `[data-test="open-menu"]` |

**Steps to reproduce**
1. On any authenticated page, inspect the hamburger menu trigger in DevTools
2. Locate `[data-test="open-menu"]`

**Expected behaviour**
`data-test="open-menu"` should be placed on the interactive element — the `<button>` — so that standard selector-based automation and assistive technology both target the same element.

**Actual behaviour**
`data-test="open-menu"` is on the child `<img class="bm-icon">` inside the button. The `<button id="react-burger-menu-btn">` wrapper intercepts all pointer events, making clicks on the `[data-test="open-menu"]` locator fail silently (Playwright reports the button as intercepting).

**Corrective action in test suite**
All menu-open interactions changed from `[data-test="open-menu"]` to `#react-burger-menu-btn`.

**Recommendation**
Move `data-test="open-menu"` from the `<img>` to the `<button>` element:
```html
<!-- Current (broken) -->
<button id="react-burger-menu-btn">
  <img data-test="open-menu" class="bm-icon" ... />
</button>

<!-- Fixed -->
<button id="react-burger-menu-btn" data-test="open-menu">
  <img class="bm-icon" ... />
</button>
```

---

## Category C — State Management Inconsistencies

---

### BUG-008 — Reset App State clears cart count but does not re-render button states in-place

| Field | Value |
|---|---|
| **ID** | BUG-008 |
| **Severity** | Low — cosmetic inconsistency |
| **Affected personas** | All authenticated users (`standard_user` confirmed) |
| **Discovered by** | Test failure — `tests/cart/cart-state.spec.ts` — "Reset App State clears cart and resets Add to Cart buttons" |

**Steps to reproduce**
1. Log in as `standard_user`
2. Add all 6 items to cart (badge shows 6)
3. Open the burger menu, click "Reset App State"
4. Without navigating, inspect the inventory item buttons

**Expected behaviour**
All "Remove" buttons immediately revert to "Add to Cart" (with `data-test="add-to-cart-*"`) in the same page render, consistent with the cart badge clearing.

**Actual behaviour**
The cart badge disappears immediately (cart state cleared). However, all inventory buttons continue to display "Remove" with `data-test="remove-*"` attributes. The button states are only updated after the user navigates away from and back to `/inventory.html`.

**Impact**
The UI is briefly inconsistent: the cart appears empty (no badge) while the inventory still shows all items as "in cart". A user who does not navigate away cannot re-add the same items without refreshing.

**Corrective action in test suite**
The test now navigates to `/inventory.html` after Reset before asserting button count, which also validates that the reset state persists across navigation.

---

## Category D — Visual Defects

---

### BUG-009 — `visual_user`: Inventory page layout contains visual defects vs. standard baseline

| Field | Value |
|---|---|
| **ID** | BUG-009 |
| **Severity** | Medium — visual regression |
| **Affected persona** | `visual_user` |
| **Discovered by** | `tests/personas/visual-user.spec.ts` — `toHaveScreenshot('inventory.png')` diff vs. `standard_user` baseline |

**Steps to reproduce**
1. Log in as `standard_user`, capture a full-page screenshot of `/inventory.html` (baseline)
2. Log in as `visual_user`, capture a full-page screenshot of the same page
3. Diff the two screenshots

**Expected behaviour**
Pixel-for-pixel identical layout (same product grid, font sizes, spacing, colours).

**Actual behaviour**
The `visual_user` screenshot differs from the `standard_user` baseline. Specific visual anomalies are captured in snapshot diffs stored at:
`tests/personas/visual-user.spec.ts-snapshots/inventory-visual-user-darwin.png`

**Note**
Functional flows (add to cart, checkout) are unaffected for `visual_user` — only visual presentation is degraded.

---

## Category E — Access Control Edge Cases

---

### BUG-010 — `locked_out_user`: Authentication error message reveals internal user status

| Field | Value |
|---|---|
| **ID** | BUG-010 |
| **Severity** | Low — information disclosure |
| **Affected persona** | `locked_out_user` |
| **Discovered by** | `tests/auth/login.spec.ts` — "locked_out_user sees locked error" |

**Steps to reproduce**
1. On the login page, enter `locked_out_user` / `secret_sauce`
2. Click Login

**Expected behaviour**
A generic credential mismatch message: `"Username and password do not match any user in this service"` — consistent with all other failure states.

**Actual behaviour**
A distinct, persona-specific message is returned: `"Epic sadface: Sorry, this user has been locked out."` This message confirms that the username exists in the system and is in a locked state, leaking internal account status to an unauthenticated caller.

**Recommendation**
Return the generic mismatch error for locked accounts in any environment facing external users. Reserve the specific locked message for internal admin tooling only.

---

## Summary Table

| ID | Title | Severity | Persona | Category |
|---|---|---|---|---|
| BUG-001 | All product images show the same wrong image | High | `problem_user` | A — Persona Defect |
| BUG-002 | Sort dropdown has no effect on product order | High | `problem_user` | A — Persona Defect |
| BUG-003 | Some "Add to Cart" buttons are non-functional | Critical | `problem_user` | A — Persona Defect |
| BUG-004 | Last Name field corrupts First Name — checkout blocked | Critical | `problem_user` | A — Persona Defect |
| BUG-005 | Backpack Add to Cart button absent from DOM | High | `error_user` | A — Persona Defect |
| BUG-006 | Checkout Finish step fails deterministically | Critical | `error_user` | A — Persona Defect |
| BUG-007 | `data-test="open-menu"` on `<img>`, not `<button>` | Medium | All users | B — HTML Structure |
| BUG-008 | Reset App State does not re-render buttons in-place | Low | All users | C — State Management |
| BUG-009 | `visual_user` inventory page has visual defects | Medium | `visual_user` | D — Visual Regression |
| BUG-010 | Locked account error leaks account existence | Low | `locked_out_user` | E — Access Control |

---

## Severity Distribution

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 3 |
| Medium | 2 |
| Low | 2 |
| **Total** | **10** |

---

## Notes on Intentional vs. Unintentional Bugs

SauceDemo is a deliberately broken application. Bugs in **Category A** (BUG-001 through BUG-006) are intentional persona defects placed by Sauce Labs to exercise test tooling. They are documented here in bug-report format to demonstrate what a real report would look like — not because they should be fixed in this demo app.

Bugs in **Categories B–E** (BUG-007 through BUG-010) represent genuine implementation issues observable through the browser: a misplaced `data-test` attribute, an inconsistent state re-render, visual regressions, and an information-disclosure pattern. These would warrant remediation in a production application.

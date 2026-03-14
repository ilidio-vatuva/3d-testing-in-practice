import { test, expect } from '../fixtures/base.fixture';
import {
  PRODUCT_NAMES_AZ,
  PRODUCT_NAMES_ZA,
  PRICES_LOW_HIGH,
  PRICES_HIGH_LOW,
} from '../../test-data/products';

test.describe('Inventory — sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
  });

  test('default sort is Name (A to Z)', async ({ page }) => {
    const names = await page.locator('.inventory_item_name').allTextContents();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test('sort Name (Z to A) reverses alphabetical order', async ({ page }) => {
    await page.selectOption('[data-test="product-sort-container"]', 'za');
    const names = await page.locator('.inventory_item_name').allTextContents();
    expect(names).toEqual(PRODUCT_NAMES_ZA);
  });

  test('sort Price (low to high) produces ascending price order', async ({ page }) => {
    await page.selectOption('[data-test="product-sort-container"]', 'lohi');
    const priceTexts = await page
      .locator('.inventory_item_price')
      .allTextContents();
    const prices = priceTexts.map(t => parseFloat(t.replace('$', '')));
    expect(prices).toEqual(PRICES_LOW_HIGH);
  });

  test('sort Price (high to low) produces descending price order', async ({ page }) => {
    await page.selectOption('[data-test="product-sort-container"]', 'hilo');
    const priceTexts = await page
      .locator('.inventory_item_price')
      .allTextContents();
    const prices = priceTexts.map(t => parseFloat(t.replace('$', '')));
    expect(prices).toEqual(PRICES_HIGH_LOW);
  });

  test('sort (A to Z) restores default after changing to Z to A', async ({ page }) => {
    await page.selectOption('[data-test="product-sort-container"]', 'za');
    await page.selectOption('[data-test="product-sort-container"]', 'az');
    const names = await page.locator('.inventory_item_name').allTextContents();
    expect(names).toEqual(PRODUCT_NAMES_AZ);
  });
});

import { test, expect } from '@playwright/test';

test('Homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ÉLANE|Mini E-Store/i);
});

test('Checkout page loads', async ({ page }) => {
  await page.goto('/checkout');
  // Just verify it doesn't crash
  await expect(page).toHaveTitle(/ÉLANE|Checkout/i);
});

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display content', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Verify the page loaded successfully
    await expect(page).toHaveTitle(/Mind-Controlled/);

    // Verify main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Verify navigation elements exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});

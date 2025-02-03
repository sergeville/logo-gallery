import { test, expect } from '@playwright/test';
import { setupVisualTest } from '../utils/test-setup';

test.describe('Logo Gallery - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await setupVisualTest(page);
  });

  test('should display empty state message', async ({ page }) => {
    // Navigate to gallery with no logos
    await page.goto('/gallery?empty=true');

    // Wait for the empty state message to be visible
    await page.waitForSelector('[data-testid="empty-gallery-message"]');

    // Take a screenshot of the empty gallery
    await expect(page).toHaveScreenshot('empty-gallery.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should display empty state in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    // Navigate to gallery with no logos
    await page.goto('/gallery?empty=true');

    // Wait for the empty state message to be visible
    await page.waitForSelector('[data-testid="empty-gallery-message"]');

    // Take a screenshot of the empty gallery in dark mode
    await expect(page).toHaveScreenshot('empty-gallery-dark.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });
});

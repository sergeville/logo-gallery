import { test, expect } from '@playwright/test';
import { setupVisualTest } from '../utils/test-setup';

test.describe('Logo Gallery - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await setupVisualTest(page);
  });

  test('should display initial loading state', async ({ page }) => {
    // Navigate to gallery with loading delay
    await page.goto('/gallery?loading=initial');

    // Wait for loading spinner to be visible
    await page.waitForSelector('[data-testid="loading-spinner"]');

    // Take a screenshot of the initial loading state
    await expect(page).toHaveScreenshot('initial-loading.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should display loading state in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    // Navigate to gallery with loading delay
    await page.goto('/gallery?loading=initial');

    // Wait for loading spinner to be visible
    await page.waitForSelector('[data-testid="loading-spinner"]');

    // Take a screenshot of the loading state in dark mode
    await expect(page).toHaveScreenshot('initial-loading-dark.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should display skeleton loading state', async ({ page }) => {
    // Navigate to gallery with skeleton loading
    await page.goto('/gallery?loading=skeleton');

    // Wait for skeleton placeholders to be visible
    await page.waitForSelector('[data-testid="skeleton-placeholder"]');

    // Take a screenshot of the skeleton loading state
    await expect(page).toHaveScreenshot('skeleton-loading.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should display partial loading state', async ({ page }) => {
    // Navigate to gallery with partial loading
    await page.goto('/gallery?loading=partial');

    // Wait for both loaded content and loading indicators
    await page.waitForSelector('[data-testid="logo-card"]');
    await page.waitForSelector('[data-testid="loading-more"]');

    // Take a screenshot of the partial loading state
    await expect(page).toHaveScreenshot('partial-loading.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });
});

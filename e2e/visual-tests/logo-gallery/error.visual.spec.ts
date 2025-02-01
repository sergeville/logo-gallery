import { test, expect } from '@playwright/test';
import { setupVisualTest } from '../utils/test-setup';

test.describe('Logo Gallery - Error States', () => {
  test.beforeEach(async ({ page }) => {
    await setupVisualTest(page);
  });

  test('should display error state when loading fails', async ({ page }) => {
    // Navigate to gallery with error trigger
    await page.goto('/gallery?error=load');

    // Wait for error message to be visible
    await page.waitForSelector('[data-testid="error-message"]');

    // Take a screenshot of the error state
    await expect(page).toHaveScreenshot('load-error.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should display error state in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    // Navigate to gallery with error trigger
    await page.goto('/gallery?error=load');

    // Wait for error message to be visible
    await page.waitForSelector('[data-testid="error-message"]');

    // Take a screenshot of the error state in dark mode
    await expect(page).toHaveScreenshot('load-error-dark.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should display network error state', async ({ page }) => {
    // Navigate to gallery with network error trigger
    await page.goto('/gallery?error=network');

    // Wait for network error message to be visible
    await page.waitForSelector('[data-testid="network-error"]');

    // Take a screenshot of the network error state
    await expect(page).toHaveScreenshot('network-error.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });

  test('should handle retry action', async ({ page }) => {
    // Navigate to gallery with error trigger
    await page.goto('/gallery?error=load');

    // Wait for error message and retry button to be visible
    await page.waitForSelector('[data-testid="retry-button"]');

    // Hover over retry button
    await page.hover('[data-testid="retry-button"]');

    // Take a screenshot of the retry button hover state
    await expect(page).toHaveScreenshot('retry-hover.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')],
    });
  });
});

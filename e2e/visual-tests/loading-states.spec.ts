import { test, expect } from '@playwright/test';

test.describe('Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-loading');
  });

  test('spinner loading state renders correctly', async ({ page }) => {
    const spinner = page.locator('[data-testid="loading-spinner"]');
    await expect(spinner).toBeVisible();
    await expect(page).toHaveScreenshot('spinner-loading.png');
  });

  test('skeleton loading state renders correctly', async ({ page }) => {
    const skeleton = page.locator('[data-testid="loading-skeleton"]');
    await expect(skeleton).toBeVisible();
    await expect(page).toHaveScreenshot('skeleton-loading.png');
  });

  test('progress loading state renders correctly', async ({ page }) => {
    const progress = page.locator('[data-testid="loading-progress"]');
    await expect(progress).toBeVisible();
    
    // Test different progress states
    for (const percentage of [0, 25, 50, 75, 100]) {
      await page.evaluate((p) => {
        window.dispatchEvent(new CustomEvent('set-progress', { detail: p }));
      }, percentage);
      await page.waitForTimeout(600); // Wait for animation
      await expect(page).toHaveScreenshot(`progress-${percentage}.png`);
    }
  });

  test('loading states handle dark mode correctly', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Test all loading states in dark mode
    await expect(page).toHaveScreenshot('dark-mode-loading-states.png');
  });

  test('loading states are accessible', async ({ page }) => {
    // Test ARIA attributes
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    await expect(page.locator('text=Loading...')).toBeVisible();
    
    // Verify color contrast meets WCAG standards
    const violations = await page.evaluate(() => {
      // Note: This requires axe-core to be included in the test page
      return window.axe.run();
    });
    expect(violations.violations).toEqual([]);
  });
}); 
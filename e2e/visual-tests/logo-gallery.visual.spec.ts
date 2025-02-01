import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from './utils/visual-test-utils';

test.describe('Logo Gallery Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('homepage layout matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for main content and images
    await page.waitForSelector('[data-testid="main-content"]', {
      state: 'visible',
      timeout: 30000,
    });

    // Ensure all images are loaded
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).every(img => img.complete);
    });

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('logo grid layout matches snapshot', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');

    // Wait for gallery container
    await page.waitForSelector('[data-testid="gallery-container"]', {
      state: 'visible',
      timeout: 30000,
    });

    await expect(page).toHaveScreenshot('logo-grid.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Test filter view if available
    const filterButton = page.locator('[data-testid="filter-button"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500); // Wait for animation
      await expect(page).toHaveScreenshot('logo-grid-filter-open.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('logo detail view matches snapshot', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');

    // Click first logo to open detail view
    await page.locator('[data-testid="logo-card"]').first().click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('logo-detail.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark mode layout matches snapshot', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500); // Wait for theme transition

    await expect(page).toHaveScreenshot('dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('responsive layouts match snapshots', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/logos');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

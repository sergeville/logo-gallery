import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from './utils/visual-test-utils';

test.describe('Homepage Visual Tests', () => {
  test('homepage layout matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    await preparePageForVisualTest(page, {
      waitForSelectors: ['main'],
      maskSelectors: ['time', '[data-dynamic]'],
    });

    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('homepage responsive layout', async ({ page }) => {
    await page.goto('/');
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await preparePageForVisualTest(page, {
      waitForSelectors: ['main'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    await expect(page).toHaveScreenshot('homepage-mobile.png');
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await preparePageForVisualTest(page, {
      waitForSelectors: ['main'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    await expect(page).toHaveScreenshot('homepage-tablet.png');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await preparePageForVisualTest(page, {
      waitForSelectors: ['main'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    await expect(page).toHaveScreenshot('homepage-desktop.png');
  });

  test('homepage dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await preparePageForVisualTest(page, {
      waitForSelectors: ['main'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    
    // Enable dark mode using next-themes
    await page.evaluate(() => {
      const html = document.documentElement;
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    
    // Wait for dark mode styles to apply
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-dark.png');
  });
}); 
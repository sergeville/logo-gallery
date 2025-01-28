import { test, expect } from '../utils/auth-setup';
import { LOCALHOST_URL } from '@/config/constants';
import {
  preparePageForVisualTest,
  testResponsiveLayouts,
  VIEWPORT_SIZES
} from '../utils/visual-test-utils';

test.describe('Visual Regression Tests - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('Homepage layout', async ({ page }) => {
    await page.goto(LOCALHOST_URL);
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 30000,
    });
  });

  test('Gallery page responsive layout', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await testResponsiveLayouts(page, [
      VIEWPORT_SIZES.mobile,
      VIEWPORT_SIZES.tablet,
      VIEWPORT_SIZES.desktop,
    ]);

    // Compare full page screenshots for each viewport
    for (const viewport of [VIEWPORT_SIZES.mobile, VIEWPORT_SIZES.tablet, VIEWPORT_SIZES.desktop]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`gallery-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        timeout: 30000,
      });
    }
  });

  test('Vote page responsive layout', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    await testResponsiveLayouts(page, [
      VIEWPORT_SIZES.mobile,
      VIEWPORT_SIZES.tablet,
      VIEWPORT_SIZES.desktop,
    ]);

    // Compare full page screenshots for each viewport
    for (const viewport of [VIEWPORT_SIZES.mobile, VIEWPORT_SIZES.tablet, VIEWPORT_SIZES.desktop]) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`vote-${viewport.width}x${viewport.height}.png`, {
        fullPage: true,
        timeout: 30000,
      });
    }
  });

  test('Navigation menu states', async ({ page }) => {
    await page.goto(LOCALHOST_URL);
    
    // Desktop navigation
    await expect(page.locator('nav')).toHaveScreenshot('nav-desktop.png', {
      timeout: 30000,
    });
    
    // Mobile navigation (closed)
    await page.setViewportSize(VIEWPORT_SIZES.mobile);
    await page.waitForTimeout(500);
    await expect(page.locator('nav')).toHaveScreenshot('nav-mobile-closed.png', {
      timeout: 30000,
    });
    
    // Mobile navigation (open)
    const menuButton = await page.waitForSelector('button[aria-label="Open menu"]', { timeout: 5000 });
    await menuButton.click();
    await page.waitForTimeout(500);
    await expect(page.locator('nav')).toHaveScreenshot('nav-mobile-open.png', {
      timeout: 30000,
    });
  });

  test('Footer layout', async ({ page }) => {
    await page.goto(LOCALHOST_URL);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page.locator('footer')).toHaveScreenshot('footer.png', {
      timeout: 30000,
    });
  });

  test('Grid layout', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Test different grid layouts
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Wait for layout to adjust
      await expect(page.locator('.grid')).toHaveScreenshot(`grid-${viewport.name}.png`, {
        timeout: 30000,
      });
    }
  });

  test('Theme switching', async ({ page }) => {
    await page.goto(LOCALHOST_URL);
    
    // Light theme
    await expect(page).toHaveScreenshot('theme-light.png', {
      fullPage: true,
      timeout: 30000,
    });
    
    // Dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('theme-dark.png', {
      fullPage: true,
      timeout: 30000,
    });
  });
}); 
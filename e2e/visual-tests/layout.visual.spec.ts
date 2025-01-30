import { test, expect } from '@/e2e/utils/auth-setup';
import { LOCALHOST_URL } from '@/config/constants';
import {
  preparePageForVisualTest,
  testResponsiveLayouts,
  VIEWPORT_SIZES,
  compareScreenshots,
  waitForElement,
  ensurePageReady
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

  test('should test responsive grid layouts', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testResponsiveLayouts(page, 'grid-layout', async (viewport) => {
      await page.setViewportSize(viewport);
      await page.route('**/api/config', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              gallery: {
                columns: viewport.width >= 1024 ? 4 : viewport.width >= 768 ? 3 : 2,
                spacing: 16,
                maxWidth: 1200,
                imageHeight: 200
              }
            }
          })
        });
      });
      await page.route('**/api/images', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: Array(6).fill(null).map((_, i) => ({
              id: String(i + 1),
              name: `Logo ${i + 1}`,
              url: `https://example.com/logo${i + 1}.png`
            }))
          })
        });
      });
      await page.goto('/gallery');
      await ensurePageReady(page);
      await waitForElement(page, '[data-testid="gallery-grid"]');
      await compareScreenshots(page, `grid-layout-${viewport.width}x${viewport.height}`);
    });
  });

  test('should test header and navigation layout', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testResponsiveLayouts(page, 'header-layout', async (viewport) => {
      await page.setViewportSize(viewport);
      await page.goto('/gallery');
      await ensurePageReady(page);
      await waitForElement(page, '[data-testid="main-header"]');
      await compareScreenshots(page, `header-layout-${viewport.width}x${viewport.height}`);
    });
  });

  test('should test footer layout', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testResponsiveLayouts(page, 'footer-layout', async (viewport) => {
      await page.setViewportSize(viewport);
      await page.goto('/gallery');
      await ensurePageReady(page);
      await waitForElement(page, '[data-testid="main-footer"]');
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000); // Wait for scroll to complete
      await compareScreenshots(page, `footer-layout-${viewport.width}x${viewport.height}`);
    });
  });
}); 
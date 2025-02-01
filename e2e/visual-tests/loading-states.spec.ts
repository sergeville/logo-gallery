import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from './utils/visual-test-utils';

declare global {
  interface Window {
    axe: {
      run: () => Promise<unknown>;
    };
  }
}

test.describe('Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show loading state while fetching data', async ({ page }) => {
    await preparePageForVisualTest(page, {
      waitForSelectors: ['.loading-indicator'],
      customStyles: `
        .loading-indicator {
          animation: none !important;
        }
      `
    });

    await page.route('**/api/data', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [] }),
        delay: 2000
      });
    });

    await page.goto('/data');
    await expect(page).toHaveScreenshot('loading-state.png');
  });

  test('should show error state when request fails', async ({ page }) => {
    await preparePageForVisualTest(page, {
      waitForSelectors: ['.error-message'],
      customStyles: `
        .error-message {
          color: red !important;
        }
      `
    });

    await page.route('**/api/data', (route) => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      });
    });

    await page.goto('/data');
    await expect(page).toHaveScreenshot('error-state.png');
  });

  test('should be accessible in all states', async ({ page }) => {
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
    });

    const results = await page.evaluate(() => {
      return window.axe.run();
    });

    expect(results.violations).toHaveLength(0);
  });
}); 
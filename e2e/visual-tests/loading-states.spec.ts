import { test, expect } from '@playwright/test';
import { preparePageForVisualTest, TestState } from './utils/visual-test-utils';
import type { AxeResults } from 'axe-core';

declare global {
  interface Window {
    axe: {
      run: () => Promise<AxeResults>;
    };
  }
}

test.describe('Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show loading state while fetching data', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'loading',
        async setup() {
          await page.route('**/api/data', async route => {
            // Delay the response to show loading state
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.fulfill({
              status: 200,
              body: JSON.stringify({ data: 'Test Data' }),
            });
          });
          await page.reload();
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="loading-content"]', states);
    await expect(page).toHaveScreenshot('loading-state.png');
  });

  test('should show error state when request fails', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'error',
        async setup() {
          await page.route('**/api/data', async route => {
            await route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Internal Server Error' }),
            });
          });
          await page.reload();
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="error-content"]', states);
    await expect(page).toHaveScreenshot('error-state.png');
  });

  test('should be accessible in all states', async ({ page }) => {
    // Load axe-core from CDN
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js',
    });

    // Test loading state accessibility
    await page.route('**/api/data', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: 'Test Data' }),
      });
    });

    const results = await page.evaluate(() => window.axe.run());
    expect(results.violations).toEqual([]);

    // Test error state accessibility
    await page.route('**/api/data', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    const errorResults = await page.evaluate(() => window.axe.run());
    expect(errorResults.violations).toEqual([]);
  });
});

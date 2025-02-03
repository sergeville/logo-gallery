import { test, expect } from '@playwright/test';
import { preparePageForVisualTest, TestState } from './utils/visual-test-utils';

test.describe('Logo Gallery Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  test('should display logos correctly', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'loaded',
        async setup() {
          // Wait for all images to be loaded
          await page.waitForFunction(() => {
            const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
            return images.every(img => img.complete);
          });
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="logo-grid"]', states);
    await expect(page).toHaveScreenshot('logo-gallery.png');
  });

  test('should handle empty state', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'empty',
        async setup() {
          await page.route('**/api/logos', async route => {
            await route.fulfill({
              status: 200,
              body: JSON.stringify({ data: [] }),
            });
          });
          await page.reload();
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="logo-grid"]', states);
    await expect(page).toHaveScreenshot('empty-gallery.png');
  });

  test('should handle loading state', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'loading',
        async setup() {
          await page.route('**/api/logos', async route => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: [{ id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }],
              }),
            });
          });
          await page.reload();
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="logo-grid"]', states);
    await expect(page).toHaveScreenshot('loading-gallery.png');
  });

  test('should handle error state', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'error',
        async setup() {
          await page.route('**/api/logos', async route => {
            await route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Failed to load logos' }),
            });
          });
          await page.reload();
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="logo-grid"]', states);
    await expect(page).toHaveScreenshot('error-gallery.png');
  });
});

import { test } from '@playwright/test';
import {
  testComponentStates,
  testResponsiveLayouts,
  preparePageForVisualTest,
  type TestState,
} from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Image Features', () => {
  test('should test image loading states', async ({ page }) => {
    await preparePageForVisualTest(page);

    const states: TestState[] = [
      {
        name: 'initial',
        action: async element => {
          await page.route('**/api/images', route => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: [{ id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }],
              }),
            });
          });
          await page.goto('/gallery');
          await element.waitFor();
        },
      },
      {
        name: 'loading',
        action: async element => {
          await page.route('**/api/images', route => {
            // Delay response to show loading state
            setTimeout(() => {
              route.fulfill({
                status: 200,
                body: JSON.stringify({
                  data: [{ id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }],
                }),
              });
            }, 2000);
          });
          await page.goto('/gallery');
          await element.waitFor();
        },
      },
      {
        name: 'error',
        action: async element => {
          await page.route('**/api/images', route => {
            route.fulfill({ status: 500 });
          });
          await page.goto('/gallery');
          await element.waitFor();
        },
      },
    ];

    await testComponentStates(page, 'image-loading', states);
  });

  test('should test image quality at different viewport sizes', async ({ page }) => {
    await preparePageForVisualTest(page);

    await page.route('**/api/images', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [{ id: '1', name: 'High Quality Logo', url: 'https://example.com/hq.png' }],
        }),
      });
    });

    await testResponsiveLayouts(page, 'image-quality');
  });

  test('should test image caching', async ({ page }) => {
    await preparePageForVisualTest(page);

    const states: TestState[] = [
      {
        name: 'uncached',
        action: async element => {
          await page.route('**/api/images', route => {
            route.fulfill({
              status: 200,
              headers: { 'x-cache': 'MISS' },
              body: JSON.stringify({
                data: [{ id: '1', name: 'Uncached Logo', url: 'https://example.com/logo.png' }],
              }),
            });
          });
          await page.goto('/gallery');
          await element.waitFor();
        },
      },
      {
        name: 'cached',
        action: async element => {
          await page.route('**/api/images', route => {
            route.fulfill({
              status: 200,
              headers: { 'x-cache': 'HIT' },
              body: JSON.stringify({
                data: [{ id: '1', name: 'Cached Logo', url: 'https://example.com/logo.png' }],
              }),
            });
          });
          await page.goto('/gallery');
          await element.waitFor();
        },
      },
    ];

    await testComponentStates(page, 'image-caching', states);
  });
});

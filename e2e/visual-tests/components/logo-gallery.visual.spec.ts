import { test } from '@playwright/test';
import {
  preparePageForVisualTest,
  testComponentStates
} from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Logo Gallery Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('logo gallery states', async ({ page }) => {
    await testComponentStates(page, 'logo-gallery', [
      {
        name: 'empty',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ data: [] })
            });
          });
          await page.goto('/gallery');
        }
      },
      {
        name: 'with-logos',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: [
                  { id: '1', name: 'Logo 1', url: 'https://example.com/logo1.png' },
                  { id: '2', name: 'Logo 2', url: 'https://example.com/logo2.png' }
                ]
              })
            });
          });
          await page.goto('/gallery');
        }
      },
      {
        name: 'error',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({ status: 500 });
          });
          await page.goto('/gallery');
        }
      }
    ]);
  });
}); 
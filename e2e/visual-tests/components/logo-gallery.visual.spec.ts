import { test } from '@playwright/test';
import {
  preparePageForVisualTest,
  testComponentStates,
  type TestState
} from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Logo Gallery Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('logo gallery states', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'empty',
        action: async (element) => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ data: [] })
            });
          });
          await page.goto('/gallery');
          await element.waitFor();
        }
      },
      {
        name: 'with-logos',
        action: async (element) => {
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
          await element.waitFor();
        }
      },
      {
        name: 'error',
        action: async (element) => {
          await page.route('**/api/images', (route) => {
            route.fulfill({ status: 500 });
          });
          await page.goto('/gallery');
          await element.waitFor();
        }
      }
    ];

    await testComponentStates(page, 'logo-gallery', states);
  });
}); 
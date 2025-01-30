import { test } from '@playwright/test';
import {
  testComponentStates,
  preparePageForVisualTest,
  compareScreenshots
} from '@/e2e/utils/visual-test-utils';

test.describe('API Response Tests', () => {
  test('should test validation responses', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testComponentStates(page, 'validation-responses', [
      {
        name: 'valid-data',
        setup: async () => {
          await page.route('**/api/validate', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: {
                  isValid: true,
                  message: 'Data validation successful'
                }
              })
            });
          });
          await page.goto('/upload');
          await page.fill('input[name="logoName"]', 'Valid Logo Name');
          await page.fill('input[name="logoUrl"]', 'https://example.com/valid-logo.png');
          await page.click('button[type="submit"]');
        }
      },
      {
        name: 'invalid-name',
        setup: async () => {
          await page.route('**/api/validate', (route) => {
            route.fulfill({
              status: 400,
              body: JSON.stringify({
                error: 'Invalid logo name format'
              })
            });
          });
          await page.goto('/upload');
          await page.fill('input[name="logoName"]', '');
          await page.fill('input[name="logoUrl"]', 'https://example.com/logo.png');
          await page.click('button[type="submit"]');
        }
      },
      {
        name: 'invalid-url',
        setup: async () => {
          await page.route('**/api/validate', (route) => {
            route.fulfill({
              status: 400,
              body: JSON.stringify({
                error: 'Invalid logo URL format'
              })
            });
          });
          await page.goto('/upload');
          await page.fill('input[name="logoName"]', 'Test Logo');
          await page.fill('input[name="logoUrl"]', 'invalid-url');
          await page.click('button[type="submit"]');
        }
      }
    ]);
  });

  test('should test configuration responses', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testComponentStates(page, 'config-responses', [
      {
        name: 'valid-config',
        setup: async () => {
          await page.route('**/api/config', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: {
                  gallery: {
                    columns: 3,
                    spacing: 16,
                    maxWidth: 1200,
                    imageHeight: 200
                  }
                }
              })
            });
          });
          await page.goto('/gallery');
        }
      },
      {
        name: 'missing-config',
        setup: async () => {
          await page.route('**/api/config', (route) => {
            route.fulfill({
              status: 404,
              body: JSON.stringify({
                error: 'Configuration not found'
              })
            });
          });
          await page.goto('/gallery');
        }
      }
    ]);
  });
}); 
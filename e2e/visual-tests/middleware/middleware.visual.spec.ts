import { test } from '@playwright/test';
import {
  testComponentStates,
  preparePageForVisualTest,
  compareScreenshots
} from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Middleware Chain Tests', () => {
  test('should test protected resource access', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testComponentStates(page, 'protected-resource', [
      {
        name: 'unauthorized',
        setup: async () => {
          await page.route('**/api/protected/resource', (route) => {
            route.fulfill({
              status: 401,
              body: JSON.stringify({
                error: 'Unauthorized access'
              })
            });
          });
          await page.goto('/protected');
        }
      },
      {
        name: 'authorized',
        setup: async () => {
          await page.route('**/api/protected/resource', (route) => {
            route.fulfill({
              status: 200,
              headers: {
                'x-middleware-cache': 'active',
                'x-middleware-auth': 'active'
              },
              body: JSON.stringify({
                data: 'Protected content'
              })
            });
          });
          await page.goto('/protected');
        }
      }
    ]);
  });

  test('should test caching middleware', async ({ page }) => {
    await preparePageForVisualTest(page);
    
    await testComponentStates(page, 'cache-middleware', [
      {
        name: 'cache-miss',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              headers: {
                'x-cache': 'MISS',
                'Cache-Control': 'public, max-age=3600'
              },
              body: JSON.stringify({
                data: [
                  { id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }
                ]
              })
            });
          });
          await page.goto('/gallery');
        }
      },
      {
        name: 'cache-hit',
        setup: async () => {
          await page.route('**/api/images', (route) => {
            route.fulfill({
              status: 200,
              headers: {
                'x-cache': 'HIT',
                'Cache-Control': 'public, max-age=3600'
              },
              body: JSON.stringify({
                data: [
                  { id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }
                ]
              })
            });
          });
          await page.goto('/gallery');
        }
      }
    ]);
  });
}); 
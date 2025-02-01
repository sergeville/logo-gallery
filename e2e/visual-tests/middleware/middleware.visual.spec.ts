import { test, expect } from '@playwright/test';
import {
  testComponentStates,
  preparePageForVisualTest,
  compareScreenshots,
  TestState
} from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Middleware Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle authentication states correctly', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'unauthorized',
        async setup() {
          await page.route('**/api/auth/session', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ user: null })
            });
          });
        },
        async action(element) {
          await element.click();
          await page.waitForSelector('.auth-required');
        }
      },
      {
        name: 'authorized',
        async setup() {
          await page.route('**/api/auth/session', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                user: {
                  id: '123',
                  name: 'Test User',
                  email: 'test@example.com'
                }
              })
            });
          });
        },
        async action(element) {
          await element.click();
          await page.waitForSelector('.auth-content');
        }
      }
    ];

    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('auth-states.png');
  });

  test('should handle caching states correctly', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'cache-miss',
        async setup() {
          await page.route('**/api/data', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: {
                  message: 'Cache Miss - Fresh Data'
                }
              }),
              headers: {
                'Cache-Control': 'no-store'
              }
            });
          });
        },
        async action(element) {
          await element.click();
          await page.waitForSelector('.cache-miss');
        }
      },
      {
        name: 'cache-hit',
        async setup() {
          await page.route('**/api/data', (route) => {
            route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: {
                  message: 'Cache Hit - Cached Data'
                }
              }),
              headers: {
                'Cache-Control': 'public, max-age=3600',
                'Age': '1800'
              }
            });
          });
        },
        async action(element) {
          await element.click();
          await page.waitForSelector('.cache-hit');
        }
      }
    ];

    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('cache-states.png');
  });

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
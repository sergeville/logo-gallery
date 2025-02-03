import { test, expect } from '@playwright/test';
import {
  testComponentStates,
  preparePageForVisualTest,
  TestState,
} from '../utils/visual-test-utils';

test.describe('Middleware Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle authentication states correctly', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'unauthorized',
        async setup() {
          await page.route('**/api/auth/session', async route => {
            await route.fulfill({
              status: 200,
              body: JSON.stringify({ user: null }),
            });
          });
        },
      },
      {
        name: 'authorized',
        async setup() {
          await page.route('**/api/auth/session', async route => {
            await route.fulfill({
              status: 200,
              body: JSON.stringify({
                user: {
                  id: '123',
                  name: 'Test User',
                  email: 'test@example.com',
                },
              }),
            });
          });
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="auth-content"]', states);
    await expect(page).toHaveScreenshot('auth-states.png');
  });

  test('should handle caching states correctly', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'cache-miss',
        async setup() {
          await page.route('**/api/data', async route => {
            await route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: {
                  message: 'Cache Miss - Fresh Data',
                },
              }),
              headers: {
                'Cache-Control': 'no-store',
              },
            });
          });
        },
      },
      {
        name: 'cache-hit',
        async setup() {
          await page.route('**/api/data', async route => {
            await route.fulfill({
              status: 200,
              body: JSON.stringify({
                data: {
                  message: 'Cache Hit - Cached Data',
                },
              }),
              headers: {
                'Cache-Control': 'public, max-age=3600',
                Age: '1800',
              },
            });
          });
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="cache-content"]', states);
    await expect(page).toHaveScreenshot('cache-states.png');
  });

  test('should test protected resource access', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'unauthorized',
        async setup() {
          await page.route('**/api/protected/resource', async route => {
            await route.fulfill({
              status: 401,
              body: JSON.stringify({
                error: 'Unauthorized access',
              }),
            });
          });
          await page.goto('/protected');
        },
      },
      {
        name: 'authorized',
        async setup() {
          await page.route('**/api/protected/resource', async route => {
            await route.fulfill({
              status: 200,
              headers: {
                'x-middleware-cache': 'active',
                'x-middleware-auth': 'active',
              },
              body: JSON.stringify({
                data: 'Protected content',
              }),
            });
          });
          await page.goto('/protected');
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="protected-content"]', states);
    await expect(page).toHaveScreenshot('protected-resource.png');
  });

  test('should test caching middleware', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'cache-miss',
        async setup() {
          await page.route('**/api/images', async route => {
            await route.fulfill({
              status: 200,
              headers: {
                'x-cache': 'MISS',
                'Cache-Control': 'public, max-age=3600',
              },
              body: JSON.stringify({
                data: [{ id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }],
              }),
            });
          });
          await page.goto('/gallery');
        },
      },
      {
        name: 'cache-hit',
        async setup() {
          await page.route('**/api/images', async route => {
            await route.fulfill({
              status: 200,
              headers: {
                'x-cache': 'HIT',
                'Cache-Control': 'public, max-age=3600',
              },
              body: JSON.stringify({
                data: [{ id: '1', name: 'Test Logo', url: 'https://example.com/test.png' }],
              }),
            });
          });
          await page.goto('/gallery');
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="cache-middleware"]', states);
    await expect(page).toHaveScreenshot('cache-middleware.png');
  });
});

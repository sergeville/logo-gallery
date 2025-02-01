import { Page } from '@playwright/test';
import { login } from './auth-utils';

export async function setupVisualTest(page: Page) {
  // Set consistent viewport size
  await page.setViewportSize({ width: 1280, height: 720 });

  // Disable animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });

  // Mock session if needed
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.png',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  // Mock API responses if needed
  await page.route('**/api/logos', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        logos: [
          {
            _id: '1',
            title: 'Test Logo 1',
            description: 'A test logo',
            imageUrl: '/test-logo-1.png',
            thumbnailUrl: '/test-logo-1-thumb.png',
            userId: 'test-user-id',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    });
  });

  // Set color scheme to light for consistent screenshots
  await page.emulateMedia({ colorScheme: 'light' });
}

export async function mockAuthenticatedSession(page: Page) {
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.png',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });
}

export async function mockUnauthenticatedSession(page: Page) {
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ user: null, expires: null }),
    });
  });
}

export async function mockApiError(page: Page, statusCode = 500) {
  await page.route('**/api/**', async route => {
    await route.fulfill({
      status: statusCode,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });
}

export async function setupTestEnvironment(): Promise<void> {
  // ... existing code ...
}

export async function cleanupTestEnvironment(): Promise<void> {
  // ... existing code ...
}

export async function setupAuthenticatedTest(page: Page): Promise<void> {
  await login(page);
}

export async function setupTestData(): Promise<void> {
  // ... existing code ...
}

export async function cleanupTestData(): Promise<void> {
  // ... existing code ...
}

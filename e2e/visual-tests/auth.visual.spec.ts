import { test, expect } from '@playwright/test';
import {
  preparePageForVisualTest,
  testComponentStates,
} from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Auth Visual Tests', () => {
  test('auth modal layout matches snapshot', async ({ page }) => {
    await page.goto('/');

    // Open auth modal by clicking the Sign In link
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.waitForURL('**/auth/signin**');

    await preparePageForVisualTest(page, {
      waitForSelectors: ['form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });

    await expect(page).toHaveScreenshot('auth-modal.png');
  });

  test('auth modal responsive layout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.waitForURL('**/auth/signin**');

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await preparePageForVisualTest(page, {
      waitForSelectors: ['form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    await expect(page).toHaveScreenshot('auth-modal-mobile.png');

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await preparePageForVisualTest(page, {
      waitForSelectors: ['form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    await expect(page).toHaveScreenshot('auth-modal-tablet.png');

    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await preparePageForVisualTest(page, {
      waitForSelectors: ['form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });
    await expect(page).toHaveScreenshot('auth-modal-desktop.png');
  });

  test('auth form states', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.waitForURL('**/auth/signin**');

    // Test form field states
    await testComponentStates(page, 'input[type="email"]', [
      { name: 'default', action: async () => {} },
      { name: 'focus', action: async el => await el.focus() },
      { name: 'filled', action: async el => await el.fill('test@example.com') },
      {
        name: 'error',
        action: async el => {
          await el.fill('invalid-email');
          await el.evaluate(e => e.blur());
        },
      },
    ]);

    // Test password field states
    await testComponentStates(page, 'input[type="password"]', [
      { name: 'default', action: async () => {} },
      { name: 'focus', action: async el => await el.focus() },
      { name: 'filled', action: async el => await el.fill('password123') },
      {
        name: 'error',
        action: async el => {
          await el.fill('123');
          await el.evaluate(e => e.blur());
        },
      },
    ]);
  });

  test('auth modal dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enable dark mode
    await page.evaluate(() => {
      const html = document.documentElement;
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    // Open auth modal
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.waitForURL('**/auth/signin**');

    await preparePageForVisualTest(page, {
      waitForSelectors: ['form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });

    await expect(page).toHaveScreenshot('auth-modal-dark.png');
  });

  test('auth error states', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.waitForURL('**/auth/signin**');

    // Test invalid credentials error
    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Click sign in and wait for error response
    await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/auth/callback/credentials') && res.status() === 401
      ),
      page.getByRole('button', { name: 'Sign in' }).click(),
    ]);

    // Wait for error message with more specific selector and longer timeout
    await page.waitForSelector('div[class*="bg-red-50"] div[class*="text-red-700"]', {
      state: 'visible',
      timeout: 30000,
    });

    await preparePageForVisualTest(page, {
      waitForSelectors: ['div[class*="bg-red-50"]', 'form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });

    await expect(page).toHaveScreenshot('auth-error-invalid-credentials.png');

    // Test network error
    await page.route('**/api/auth/**', route => route.abort('failed'));
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for network error message
    await page.waitForSelector('div[class*="bg-red-50"] div[class*="text-red-700"]', {
      state: 'visible',
      timeout: 30000,
    });

    await preparePageForVisualTest(page, {
      waitForSelectors: ['div[class*="bg-red-50"]', 'form'],
      maskSelectors: ['time', '[data-dynamic]'],
    });

    await expect(page).toHaveScreenshot('auth-error-network.png');
  });
});

import { test, expect } from '@playwright/test';
import { preparePageForVisualTest, testComponentStates, VIEWPORT_SIZES } from '../utils/visual-test-utils';

/**
 * Visual regression tests for the authentication components
 * Tests various states and responsive layouts of the auth pages
 */
test.describe('Authentication Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('sign in form visual states', async ({ page }) => {
    await page.goto('/auth/signin');

    const states = [
      {
        name: 'default',
        setup: async () => {
          await page.goto('/auth/signin');
        }
      },
      {
        name: 'loading',
        setup: async () => {
          await page.goto('/auth/signin');
          await page.getByRole('button', { name: 'Sign in' }).click();
        }
      },
      {
        name: 'error',
        setup: async () => {
          await page.goto('/auth/signin');
          await page.getByPlaceholder('Email').fill('invalid@email.com');
          await page.getByPlaceholder('Password').fill('wrongpass');
          await page.getByRole('button', { name: 'Sign in' }).click();
        }
      },
      {
        name: 'empty',
        setup: async () => {
          await page.goto('/auth/signin');
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
        }
      }
    ];

    await testComponentStates(page, '[data-testid="signin-form"]', states);

    // Test responsive layouts
    for (const [device, viewport] of Object.entries(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport);
      await expect(page).toHaveScreenshot(`signin-form-${device}.png`);
    }

    // Test accessibility
    const accessibilityReport = await page.evaluate(() => {
      return new Promise(resolve => {
        // @ts-expect-error - axe is loaded globally
        window.axe.run((err, results) => {
          resolve(results);
        });
      });
    });
    expect(accessibilityReport.violations).toEqual([]);
  });

  test('sign up form visual states', async ({ page }) => {
    await page.goto('/auth/signup');

    const states = [
      {
        name: 'default',
        setup: async () => {
          await page.goto('/auth/signup');
        }
      },
      {
        name: 'loading',
        setup: async () => {
          await page.goto('/auth/signup');
          await page.getByRole('button', { name: 'Sign up' }).click();
        }
      },
      {
        name: 'error',
        setup: async () => {
          await page.goto('/auth/signup');
          await page.getByPlaceholder('Email').fill('invalid@email.com');
          await page.getByPlaceholder('Password').fill('short');
          await page.getByRole('button', { name: 'Sign up' }).click();
        }
      },
      {
        name: 'empty',
        setup: async () => {
          await page.goto('/auth/signup');
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
        }
      }
    ];

    await testComponentStates(page, '[data-testid="signup-form"]', states);

    // Test responsive layouts
    for (const [device, viewport] of Object.entries(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport);
      await expect(page).toHaveScreenshot(`signup-form-${device}.png`);
    }

    // Test accessibility
    const accessibilityReport = await page.evaluate(() => {
      return new Promise(resolve => {
        // @ts-expect-error - axe is loaded globally
        window.axe.run((err, results) => {
          resolve(results);
        });
      });
    });
    expect(accessibilityReport.violations).toEqual([]);
  });
});


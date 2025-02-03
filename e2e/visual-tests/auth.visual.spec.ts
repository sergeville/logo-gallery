import { test, expect } from '@playwright/test';
import { 
  preparePageForVisualTest, 
  testComponentStates, 
  VIEWPORT_SIZES, 
  runAccessibilityTest,
  TestState,
  AccessibilityResult 
} from './utils/visual-test-utils';

/**
 * Visual regression tests for authentication components.
 * Tests various states and responsive layouts of the auth pages.
 * 
 * @remarks
 * Test Coverage:
 * - Sign In Form:
 *   - Default state
 *   - Loading state
 *   - Error state
 *   - Empty state
 * - Responsive layouts
 * - Accessibility
 * - Social login buttons
 * - Dark mode
 */
test.describe('Authentication Visual Tests', () => {
  /**
   * Setup for each test case
   */
  test.beforeEach(async ({ page }): Promise<void> => {
    await page.goto('/auth/signin');
    await preparePageForVisualTest(page);
  });

  /**
   * Tests sign-in form states and accessibility
   */
  test('sign in form visual states', async ({ page }): Promise<void> => {
    const states: TestState[] = [
      {
        name: 'default',
        setup: async (): Promise<void> => {
          await page.goto('/auth/signin');
        }
      },
      {
        name: 'loading',
        setup: async (): Promise<void> => {
          await page.goto('/auth/signin');
          await page.getByRole('button', { name: 'Sign in' }).click();
        }
      },
      {
        name: 'error',
        setup: async (): Promise<void> => {
          await page.goto('/auth/signin');
          await page.getByPlaceholder('Email').fill('invalid@email.com');
          await page.getByPlaceholder('Password').fill('wrongpass');
          await page.getByRole('button', { name: 'Sign in' }).click();
        }
      },
      {
        name: 'empty',
        setup: async (): Promise<void> => {
          await page.goto('/auth/signin');
          await page.getByPlaceholder('Email').fill('');
          await page.getByPlaceholder('Password').fill('');
        }
      }
    ];

    // Test component states
    await testComponentStates(page, '[data-testid="signin-form"]', states);

    // Test responsive layouts
    for (const [device, viewport] of Object.entries(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport);
      await expect(page).toHaveScreenshot(`signin-form-${device}.png`);
    }

    // Test accessibility
    const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
    expect(accessibilityReport.violations).toEqual([]);
  });

  /**
   * Tests social login button states
   */
  test('social login buttons', async ({ page }): Promise<void> => {
    const states: TestState[] = [
      {
        name: 'default',
        setup: async (): Promise<void> => {
          await page.goto('/auth/signin');
        }
      },
      {
        name: 'hover',
        setup: async (): Promise<void> => {
          await page.goto('/auth/signin');
          await page.getByRole('button', { name: 'Continue with Google' }).hover();
        }
      }
    ];

    await testComponentStates(page, '[data-testid="social-login-buttons"]', states);
  });

  /**
   * Tests dark mode appearance
   */
  test('dark mode appearance', async ({ page }): Promise<void> => {
    await page.goto('/auth/signin');
    await page.evaluate((): void => {
      document.documentElement.classList.add('dark');
    });
    await preparePageForVisualTest(page);
    await expect(page).toHaveScreenshot('signin-form-dark-mode.png');
  });

  test('sign out visual states', async ({ page }) => {
    // First sign in
    const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
    const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;

    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/gallery');

    // Take screenshot of authenticated state
    await expect(page).toHaveScreenshot('auth-authenticated.png');

    // Click sign out
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('/');

    // Take screenshot of signed out state
    await expect(page).toHaveScreenshot('auth-signed-out.png');

    // Verify UI elements
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('text=Upload Logo')).not.toBeVisible();

    // Test accessibility after sign out
    const accessibilityReport = await runAccessibilityTest(page);
    expect(accessibilityReport.violations).toEqual([]);
  });
});

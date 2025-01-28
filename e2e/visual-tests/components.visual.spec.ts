import { test, expect } from '../utils/auth-setup';
import { LOCALHOST_URL } from '@/config/constants';
import {
  preparePageForVisualTest,
  testComponentStates,
  testResponsiveLayouts,
  VIEWPORT_SIZES,
  COMPONENT_STATES
} from '../utils/visual-test-utils';

test.describe('Visual Regression Tests - Components', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('Button component states', async ({ authenticatedPage: page }) => {
    // Go to a page with a primary button
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await page.waitForLoadState('networkidle');
    
    // Wait for the button to be visible
    const buttonSelector = 'button.inline-flex.items-center.px-4.py-2.border.border-transparent.rounded-md.shadow-sm.text-sm.font-medium.text-white.bg-primary-blue';
    await page.waitForSelector(buttonSelector, { state: 'visible', timeout: 10000 });
    
    // Take screenshot of default state
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-default.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });

    // Test hover state
    await page.hover(buttonSelector);
    await page.waitForTimeout(500); // Wait for hover effect
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-hover.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });

    // Test focus state
    await page.focus(buttonSelector);
    await page.waitForTimeout(500); // Wait for focus effect
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-focus.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });

    // Test disabled state
    await page.evaluate((sel: string) => {
      const button = document.querySelector(sel) as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.classList.add('disabled');
      }
    }, buttonSelector);
    await page.waitForTimeout(500); // Wait for disabled state
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-disabled.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });
  });

  test('Input field states', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await page.waitForLoadState('networkidle');
    
    // Wait for the search input to be visible
    const inputSelector = 'input[placeholder="Search logos..."]';
    await page.waitForSelector(inputSelector, { state: 'visible', timeout: 10000 });
    
    // Take screenshot of default state
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-default.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });

    // Test focus state
    await page.focus(inputSelector);
    await page.waitForTimeout(500); // Wait for focus effect
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-focus.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });

    // Test filled state
    await page.fill(inputSelector, 'Test input');
    await page.waitForTimeout(500); // Wait for input to be filled
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-filled.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });

    // Test error state
    await page.evaluate((sel: string) => {
      const input = document.querySelector(sel) as HTMLInputElement;
      if (input) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
      }
    }, inputSelector);
    await page.waitForTimeout(500); // Wait for error state
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-error.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });
  });

  test('Responsive layout', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    
    await testResponsiveLayouts(page, [
      VIEWPORT_SIZES.mobile,
      VIEWPORT_SIZES.tablet,
      VIEWPORT_SIZES.desktop,
      VIEWPORT_SIZES.widescreen,
    ]);

    // Compare full page screenshots
    await expect(page).toHaveScreenshot('gallery-responsive.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.1,
      timeout: 30000,
    });
  });

  test('Dark mode', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    
    // Test light mode
    await expect(page).toHaveScreenshot('gallery-light.png', {
      fullPage: true,
      timeout: 30000,
    });

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);

    // Test dark mode
    await expect(page).toHaveScreenshot('gallery-dark.png', {
      fullPage: true,
      timeout: 30000,
    });
  });

  test('Loading states', async ({ authenticatedPage: page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await page.waitForLoadState('networkidle');
    
    // Mock a slow API response to trigger loading state
    await page.route('**/api/logos**', async (route: any) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay response by 2s
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          logos: [],
          pagination: { current: 1, total: 0, hasMore: false }
        })
      });
    });

    // Find and fill the search input to trigger a new request
    const searchInput = page.locator('input[placeholder="Search logos..."]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill('test');
    
    // Wait for and capture the loading spinner
    const spinnerSelector = 'div.animate-spin';
    await page.waitForSelector(spinnerSelector, { state: 'visible', timeout: 10000 });
    
    // Add a small delay to ensure the spinner is fully visible
    await page.waitForTimeout(500);
    
    await expect(page.locator(spinnerSelector)).toHaveScreenshot('loading-spinner.png', {
      timeout: 15000,
      maxDiffPixelRatio: 0.2
    });
  });
}); 
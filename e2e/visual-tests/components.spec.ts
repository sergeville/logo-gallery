import { test, expect } from '@playwright/test';
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

  test('Button component states', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    
    const buttonSelector = 'button.primary';
    await testComponentStates(page, buttonSelector, {
      default: async () => {},
      hover: async () => await COMPONENT_STATES.hover(page, buttonSelector),
      focus: async () => await COMPONENT_STATES.focus(page, buttonSelector),
      active: async () => await COMPONENT_STATES.active(page, buttonSelector),
      disabled: async () => await page.evaluate((sel) => {
        const button = document.querySelector(sel) as HTMLButtonElement;
        if (button) button.disabled = true;
      }, buttonSelector),
    });

    // Compare with baseline
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-states.png');
  });

  test('Input field states', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    
    const inputSelector = 'input[type="text"]';
    await testComponentStates(page, inputSelector, {
      default: async () => {},
      focus: async () => await COMPONENT_STATES.focus(page, inputSelector),
      filled: async () => {
        await page.fill(inputSelector, 'Test input');
        await page.waitForTimeout(100);
      },
      error: async () => {
        await page.evaluate((sel) => {
          const input = document.querySelector(sel) as HTMLInputElement;
          if (input) {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
          }
        }, inputSelector);
      },
    });

    // Compare with baseline
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-states.png');
  });

  test('Responsive layout', async ({ page }) => {
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
    });
  });

  test('Dark mode', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    
    // Test light mode
    await expect(page).toHaveScreenshot('gallery-light.png', {
      fullPage: true,
    });

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);

    // Test dark mode
    await expect(page).toHaveScreenshot('gallery-dark.png', {
      fullPage: true,
    });
  });

  test('Loading states', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    
    // Simulate loading state
    await page.evaluate(() => {
      const loadingElements = document.querySelectorAll('[aria-busy="true"]');
      loadingElements.forEach(el => el.setAttribute('data-testid', 'loading'));
    });

    // Compare loading states
    await expect(page.locator('[data-testid="loading"]')).toHaveScreenshot('loading-states.png');
  });
}); 
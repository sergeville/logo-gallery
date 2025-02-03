import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Loading States Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('loading states', async ({ page }) => {
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

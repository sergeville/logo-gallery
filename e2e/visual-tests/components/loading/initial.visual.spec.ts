import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Loading Initial State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('initial loading state', async ({ page }) => {
    // Mock API to delay response to trigger loading state
    await page.route('**/api/images', route => {
      return new Promise(resolve => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ data: [] }),
          });
        }, 1000);
      });
    });

    await page.goto(`${LOCALHOST_URL}/gallery`);

    // Capture the loading state immediately after navigation
    await expect(page.locator('[data-testid="loading-initial"]')).toHaveScreenshot(
      'loading-initial.png'
    );
  });
});

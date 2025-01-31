import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Light Theme', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('light theme appearance', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await expect(page).toHaveScreenshot('theme-light.png', {
      fullPage: true,
    });
  });
}); 
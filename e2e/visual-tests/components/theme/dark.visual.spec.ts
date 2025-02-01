import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Dark Theme', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('dark theme appearance', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('theme-dark.png', {
      fullPage: true,
    });
  });
});

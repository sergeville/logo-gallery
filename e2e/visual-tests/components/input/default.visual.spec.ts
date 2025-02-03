import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Input Default State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('default state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    const inputSelector = 'input[type="text"]';
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-default.png');
  });
});

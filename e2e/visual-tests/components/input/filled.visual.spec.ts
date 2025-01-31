import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Input Filled State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('filled state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    const inputSelector = 'input[type="text"]';
    await page.fill(inputSelector, 'Test input');
    await page.waitForTimeout(100);
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-filled.png');
  });
}); 
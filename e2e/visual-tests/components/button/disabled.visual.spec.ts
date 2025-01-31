import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Button Disabled State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('disabled state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    const buttonSelector = 'button.primary';
    await page.evaluate((sel) => {
      const button = document.querySelector(sel) as HTMLButtonElement;
      if (button) button.disabled = true;
    }, buttonSelector);
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-disabled.png');
  });
}); 
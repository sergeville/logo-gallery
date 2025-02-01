import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Input Error State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('error state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    const inputSelector = 'input[type="text"]';
    await page.evaluate(sel => {
      const input = document.querySelector(sel) as HTMLInputElement;
      if (input) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
      }
    }, inputSelector);
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-error.png');
  });
});

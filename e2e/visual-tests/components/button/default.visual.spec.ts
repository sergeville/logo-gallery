import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Button Default State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('default state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    const buttonSelector = 'button.primary';
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-default.png');
  });
}); 
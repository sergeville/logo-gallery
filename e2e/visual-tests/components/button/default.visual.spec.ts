import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest } from '@/e2e/visual-tests/utils/visual-test-utils';
import { signIn } from '@/e2e/visual-tests/utils/auth-utils';

test.describe('Button Default State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
    await signIn(page);
  });

  test('default state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    const buttonSelector = 'button[class*="bg-primary-blue"]';
    await page.waitForSelector(buttonSelector, { state: 'visible', timeout: 10000 });
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-default.png');
  });
});

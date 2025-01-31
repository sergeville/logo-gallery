import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest, COMPONENT_STATES } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Input Focus State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('focus state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    const inputSelector = 'input[type="text"]';
    await COMPONENT_STATES.focus(page, inputSelector);
    await expect(page.locator(inputSelector)).toHaveScreenshot('input-focus.png');
  });
}); 
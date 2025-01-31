import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest, COMPONENT_STATES } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Button Focus State', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('focus state', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    const buttonSelector = 'button.primary';
    await COMPONENT_STATES.focus(page, buttonSelector);
    await expect(page.locator(buttonSelector)).toHaveScreenshot('button-focus.png');
  });
}); 
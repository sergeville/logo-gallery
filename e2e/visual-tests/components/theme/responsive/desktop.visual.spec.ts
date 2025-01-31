import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';
import { preparePageForVisualTest, VIEWPORT_SIZES } from '@/e2e/visual-tests/utils/visual-test-utils';

test.describe('Desktop Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('desktop layout', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await page.setViewportSize(VIEWPORT_SIZES.desktop);
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('responsive-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.1,
    });
  });
}); 
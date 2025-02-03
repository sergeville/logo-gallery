import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('/');

    // Take a screenshot of the entire page
    expect(
      await page.screenshot({
        fullPage: true,
      })
    ).toMatchSnapshot('homepage.png');
  });

  test('homepage in dark mode should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    expect(
      await page.screenshot({
        fullPage: true,
      })
    ).toMatchSnapshot('homepage-dark.png');
  });

  test('homepage on mobile should match snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    expect(
      await page.screenshot({
        fullPage: true,
      })
    ).toMatchSnapshot('homepage-mobile.png');
  });

  test('auth modal should match snapshot', async ({ page }) => {
    await page.goto('/auth/signin');

    // Wait for the modal to be visible
    await page.waitForSelector('[role="dialog"]');

    expect(await page.locator('[role="dialog"]').screenshot()).toMatchSnapshot('auth-modal.png');
  });
});

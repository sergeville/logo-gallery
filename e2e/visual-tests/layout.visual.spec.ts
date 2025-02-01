import { test, expect } from '@playwright/test';
import {
  VIEWPORT_SIZES,
  preparePageForVisualTest,
  TestState,
  VisualTestOptions,
} from './utils/visual-test-utils';

interface Viewport {
  width: number;
  height: number;
}

test.describe('Layout Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render grid layout correctly across viewports', async ({ page }) => {
    const options: VisualTestOptions = {
      waitForSelectors: ['[data-testid="grid-layout"]'],
      customStyles: `
        .grid-layout {
          gap: 16px !important;
        }
      `,
      setup: async () => {
        await page.waitForSelector('[data-testid="grid-layout"]');
      },
    };

    for (const viewport of Object.values(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport as Viewport);
      await preparePageForVisualTest(page, options);
      await expect(page).toHaveScreenshot(`grid-layout-${viewport.width}x${viewport.height}.png`);
    }
  });

  test('should render header correctly across viewports', async ({ page }) => {
    const options: VisualTestOptions = {
      waitForSelectors: ['[data-testid="header"]'],
      customStyles: `
        .header {
          position: fixed !important;
          top: 0 !important;
        }
      `,
      setup: async () => {
        await page.waitForSelector('[data-testid="header"]');
      },
    };

    for (const viewport of Object.values(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport as Viewport);
      await preparePageForVisualTest(page, options);
      await expect(page).toHaveScreenshot(`header-${viewport.width}x${viewport.height}.png`);
    }
  });

  test('should render footer correctly across viewports', async ({ page }) => {
    const options: VisualTestOptions = {
      waitForSelectors: ['[data-testid="footer"]'],
      customStyles: `
        .footer {
          position: fixed !important;
          bottom: 0 !important;
        }
      `,
      setup: async () => {
        await page.waitForSelector('[data-testid="footer"]');
      },
    };

    for (const viewport of Object.values(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport as Viewport);
      await preparePageForVisualTest(page, options);
      await expect(page).toHaveScreenshot(`footer-${viewport.width}x${viewport.height}.png`);
    }
  });

  test('should handle responsive navigation menu', async ({ page }) => {
    const states: TestState[] = [
      {
        name: 'mobile-closed',
        async setup() {
          await page.setViewportSize(VIEWPORT_SIZES.mobile as Viewport);
        },
      },
      {
        name: 'mobile-open',
        async setup() {
          await page.setViewportSize(VIEWPORT_SIZES.mobile as Viewport);
          await page.click('[data-testid="menu-button"]');
        },
      },
      {
        name: 'desktop',
        async setup() {
          await page.setViewportSize(VIEWPORT_SIZES.desktop as Viewport);
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="navigation"]', states);
    await expect(page).toHaveScreenshot('navigation-states.png');
  });
});

import { Page } from '@playwright/test';

/**
 * Prepare the page for visual testing by disabling animations and transitions
 */
export async function preparePageForVisualTest(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        -webkit-animation: none !important;
        -webkit-transition: none !important;
      }
    `
  });
}

/**
 * Test different component states for visual regression
 */
export async function testComponentStates(page: Page, selector: string, states: { [key: string]: () => Promise<void> }) {
  for (const [stateName, stateAction] of Object.entries(states)) {
    await stateAction();
    await page.waitForTimeout(500); // Wait for any visual changes to settle
    await page.screenshot({
      path: `screenshots/${selector.replace(/[^a-z0-9]/gi, '_')}-${stateName}.png`,
      clip: await page.locator(selector).boundingBox() || undefined,
    });
  }
}

/**
 * Test responsive layouts at different viewport sizes
 */
export async function testResponsiveLayouts(page: Page, viewports: { width: number; height: number }[]) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // Wait for layout to adjust
    await page.screenshot({
      path: `screenshots/viewport-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });
  }
}

/**
 * Compare screenshots with a maximum allowed difference
 */
export async function compareScreenshots(
  actualPath: string,
  expectedPath: string,
  maxDiffPixels = 100,
  threshold = 0.2
): Promise<boolean> {
  // This is a placeholder for actual implementation
  // In a real project, you would use a library like pixelmatch or resemblejs
  console.log('Comparing screenshots:', { actualPath, expectedPath, maxDiffPixels, threshold });
  return true;
}

/**
 * Common viewport sizes for testing
 */
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  widescreen: { width: 1920, height: 1080 },
};

/**
 * Common component states for testing
 */
export const COMPONENT_STATES = {
  default: async () => {}, // Do nothing, test default state
  hover: async (page: Page, selector: string) => {
    await page.hover(selector);
  },
  focus: async (page: Page, selector: string) => {
    await page.focus(selector);
  },
  active: async (page: Page, selector: string) => {
    await page.click(selector, { noWaitAfter: true });
  },
}; 
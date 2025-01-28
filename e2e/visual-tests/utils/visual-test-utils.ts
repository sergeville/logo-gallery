import { Page, expect } from '@playwright/test';

export interface VisualTestOptions {
  maskSelectors?: string[];
  removeSelectors?: string[];
  waitForSelectors?: string[];
  waitForTimeout?: number;
  customStyles?: string;
}

export async function preparePageForVisualTest(page: Page, options: VisualTestOptions = {}) {
  const {
    maskSelectors = [],
    removeSelectors = [],
    waitForSelectors = [],
    waitForTimeout = 1000,
    customStyles = '',
  } = options;

  // Wait for specified selectors
  if (waitForSelectors.length > 0) {
    await Promise.all(
      waitForSelectors.map((selector) =>
        page.waitForSelector(selector, { state: 'visible', timeout: 30000 })
      )
    );
  }

  // Remove dynamic elements
  if (removeSelectors.length > 0) {
    await page.evaluate((selectors) => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      });
    }, removeSelectors);
  }

  // Add custom styles to stabilize the page
  await page.addStyleTag({
    content: `
      * {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      ${customStyles}
    `,
  });

  // Wait for any animations to complete
  await page.waitForTimeout(waitForTimeout);

  return {
    takeScreenshot: async (name: string) => {
      await expect(page).toHaveScreenshot(name, {
        mask: maskSelectors.map((selector) => page.locator(selector)),
      });
    },
  };
}

export async function testResponsiveLayouts(
  page: Page,
  name: string,
  options: VisualTestOptions = {}
) {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await preparePageForVisualTest(page, options);
    await expect(page).toHaveScreenshot(`${name}-${viewport.name}.png`);
  }
}

export async function testComponentStates(
  page: Page,
  selector: string,
  states: Array<{ name: string; action: (element: any) => Promise<void> }>,
  options: VisualTestOptions = {}
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });

  for (const state of states) {
    await state.action(element);
    await preparePageForVisualTest(page, options);
    await expect(element).toHaveScreenshot(`${selector}-${state.name}.png`);
  }
}

export async function compareScreenshots(
  page: Page,
  name: string,
  beforeAction: () => Promise<void>,
  afterAction: () => Promise<void>,
  options: VisualTestOptions = {}
) {
  // Take before screenshot
  await beforeAction();
  await preparePageForVisualTest(page, options);
  await expect(page).toHaveScreenshot(`${name}-before.png`);

  // Take after screenshot
  await afterAction();
  await preparePageForVisualTest(page, options);
  await expect(page).toHaveScreenshot(`${name}-after.png`);
} 
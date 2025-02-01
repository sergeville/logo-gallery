import { Page, expect, Locator } from '@playwright/test';

export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 }
};

export interface VisualTestOptions {
  maskSelectors?: string[];
  removeSelectors?: string[];
  waitForSelectors?: string[];
  waitForTimeout?: number;
  customStyles?: string;
  setup?: () => Promise<void>;
}

export interface TestState {
  name: string;
  action: (element: Locator) => Promise<void>;
  setup?: () => Promise<void>;
}

export async function waitForElement(page: Page, selector: string, timeout = 30000) {
  return page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function ensurePageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

export async function preparePageForVisualTest(page: Page, options: VisualTestOptions = {}) {
  const {
    maskSelectors = [],
    removeSelectors = [],
    waitForSelectors = [],
    waitForTimeout = 1000,
    customStyles = '',
    setup,
  } = options;

  // Run setup if provided
  if (setup) {
    await setup();
  }

  // Wait for specified selectors
  if (waitForSelectors.length > 0) {
    await Promise.all(
      waitForSelectors.map((selector) =>
        waitForElement(page, selector)
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
    { ...VIEWPORT_SIZES.mobile, name: 'mobile' },
    { ...VIEWPORT_SIZES.tablet, name: 'tablet' },
    { ...VIEWPORT_SIZES.desktop, name: 'desktop' },
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
  states: TestState[],
  options: VisualTestOptions = {}
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });

  for (const state of states) {
    if (state.setup) {
      await state.setup();
    }
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
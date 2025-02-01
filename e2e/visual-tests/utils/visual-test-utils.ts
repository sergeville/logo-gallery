import { Page, expect, Locator } from '@playwright/test';

export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

export interface TestState {
  name: string;
  setup: () => Promise<void>;
  action?: (element: Locator) => Promise<void>;
}

export interface VisualTestOptions {
  waitForSelectors?: string[];
  customStyles?: string;
  setup?: () => Promise<void>;
  maskSelectors?: string[];
  removeSelectors?: string[];
  waitForTimeout?: number;
}

export async function waitForElement(page: Page, selector: string, timeout = 30000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

export async function ensurePageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

export async function preparePageForVisualTest(
  page: Page,
  options: VisualTestOptions = {}
): Promise<void> {
  const {
    waitForSelectors = [],
    customStyles = '',
    setup,
    maskSelectors = [],
    removeSelectors = [],
    waitForTimeout = 1000,
  } = options;

  // Wait for all specified selectors
  await Promise.all(waitForSelectors.map(selector => page.waitForSelector(selector)));

  // Add custom styles if provided
  if (customStyles) {
    await page.addStyleTag({ content: customStyles });
  }

  // Run custom setup if provided
  if (setup) {
    await setup();
  }

  // Ensure all images are loaded
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
    return images.every(img => img.complete);
  });

  // Wait for any animations to complete
  await page.evaluate(() => {
    return new Promise<void>(resolve => {
      const observer = new MutationObserver(mutations => {
        const hasAnimations = mutations.some(
          mutation =>
            mutation.target instanceof HTMLElement &&
            window.getComputedStyle(mutation.target).animation !== 'none'
        );

        if (!hasAnimations) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      // Resolve after 2s if no animations are detected
      setTimeout(resolve, 2000);
    });
  });
}

export async function testResponsiveLayouts(
  page: Page,
  viewports: (typeof VIEWPORT_SIZES)[keyof typeof VIEWPORT_SIZES][]
): Promise<void> {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500); // Allow time for responsive layout to adjust
  }
}

export async function testComponentStates(
  page: Page,
  selector: string,
  states: TestState[]
): Promise<void> {
  for (const state of states) {
    // Run state setup
    await state.setup();

    // Wait for component to be visible
    await page.waitForSelector(selector, { state: 'visible' });

    // Prepare page for visual test
    await preparePageForVisualTest(page);
  }
}

export async function compareScreenshots(
  page: Page,
  name: string,
  beforeAction: () => Promise<void>,
  afterAction: () => Promise<void>,
  options: VisualTestOptions = {}
): Promise<void> {
  // Take before screenshot
  await beforeAction();
  await preparePageForVisualTest(page, options);
  await expect(page).toHaveScreenshot(`${name}-before.png`);

  // Take after screenshot
  await afterAction();
  await preparePageForVisualTest(page, options);
  await expect(page).toHaveScreenshot(`${name}-after.png`);
}

export async function waitForImagesLoaded(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
    return images.every(img => img.complete);
  });
}

export async function waitForAnimationsComplete(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>(resolve => {
      const observer = new MutationObserver(mutations => {
        const hasAnimations = mutations.some(
          mutation =>
            mutation.target instanceof HTMLElement &&
            window.getComputedStyle(mutation.target).animation !== 'none'
        );

        if (!hasAnimations) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      // Resolve after 2s if no animations are detected
      setTimeout(resolve, 2000);
    });
  });
}

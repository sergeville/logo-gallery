import { Page } from '@playwright/test';
import { injectAxe } from 'axe-playwright';

/**
 * Standard viewport sizes for responsive testing
 */
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

/**
 * Represents a test state configuration
 */
export interface TestState {
  /** Name of the test state */
  name: string;
  /** Setup function to prepare the state */
  setup?: () => Promise<void>;
}

/**
 * Options for visual test preparation
 */
export interface VisualTestOptions {
  /** Selectors to wait for before testing */
  waitForSelectors?: string[];
  /** Custom styles to inject */
  customStyles?: string;
  /** Custom setup function */
  setup?: () => Promise<void>;
}

/**
 * Represents an accessibility violation
 */
export interface AccessibilityViolation {
  /** Unique identifier */
  id: string;
  /** Severity of the violation */
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  /** Description of the violation */
  description: string;
  /** Affected nodes */
  nodes: Array<{
    target: string[];
    html: string;
  }>;
}

/**
 * Results from an accessibility test
 */
export interface AccessibilityResult {
  /** Found violations */
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
}

declare global {
  interface Window {
    axe: {
      run: (callback: (err: Error | null, results: AccessibilityResult) => void) => void;
    }
  }
}

/**
 * Waits for an element to be visible
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param timeout - Wait timeout in ms
 */
export async function waitForElement(page: Page, selector: string, timeout = 30000): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Ensures the page is ready for testing
 * @param page - Playwright page object
 */
export async function ensurePageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Prepares a page for visual testing
 * @param page - Playwright page object
 * @param options - Visual test options
 */
export async function preparePageForVisualTest(
  page: Page,
  options: VisualTestOptions = {}
): Promise<void> {
  const { waitForSelectors = [], customStyles = '', setup } = options;

  // Wait for specified selectors
  for (const selector of waitForSelectors) {
    await page.waitForSelector(selector);
  }

  // Apply custom styles if provided
  if (customStyles) {
    await page.addStyleTag({ content: customStyles });
  }

  // Run custom setup if provided
  if (setup) {
    await setup();
  }
}

/**
 * Tests responsive layouts across different viewport sizes
 * @param page - Playwright page object
 * @param viewports - Array of viewport sizes to test
 */
export async function testResponsiveLayouts(
  page: Page,
  viewports: (typeof VIEWPORT_SIZES)[keyof typeof VIEWPORT_SIZES][]
): Promise<void> {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);
  }
}

/**
 * Tests component states
 * @param page - Playwright page object
 * @param selector - Component selector
 * @param states - Array of states to test
 */
export async function testComponentStates(
  page: Page,
  selector: string,
  states: TestState[]
): Promise<void> {
  for (const state of states) {
    await state.setup?.();
    await page.waitForSelector(selector, { state: 'visible' });
    await preparePageForVisualTest(page);
  }
}

/**
 * Compares screenshots before and after an action
 * @param page - Playwright page object
 * @param name - Screenshot name
 * @param beforeAction - Action to perform before screenshot
 * @param afterAction - Action to perform after screenshot
 * @param options - Visual test options
 */
export async function compareScreenshots(
  page: Page,
  name: string,
  beforeAction: () => Promise<void>,
  afterAction: () => Promise<void>,
  options: VisualTestOptions = {}
): Promise<void> {
  await beforeAction();
  await preparePageForVisualTest(page, options);
  await page.screenshot({ path: `${name}-before.png` });

  await afterAction();
  await preparePageForVisualTest(page, options);
  await page.screenshot({ path: `${name}-after.png` });
}

/**
 * Waits for all images to be loaded
 * @param page - Playwright page object
 */
export async function waitForImagesLoaded(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const images: HTMLImageElement[] = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete);
  });
}

/**
 * Waits for all animations to complete
 * @param page - Playwright page object
 */
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

      setTimeout(resolve, 2000);
    });
  });
}

/**
 * Runs accessibility tests using axe-core
 * @param page - Playwright page object
 * @returns Accessibility test results
 */
export async function runAccessibilityTest(page: Page): Promise<AccessibilityResult> {
  await injectAxe(page);
  return new Promise((resolve, reject) => {
    page.evaluate(() => {
      return window.axe.run();
    }).then(resolve).catch(reject);
  });
}

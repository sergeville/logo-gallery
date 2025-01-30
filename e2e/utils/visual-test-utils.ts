import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Common viewport sizes for responsive testing
 */
export const VIEWPORT_SIZES = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  widescreen: { width: 1920, height: 1080 }
};

/**
 * Default timeout for visual tests
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Prepare the page for visual testing by disabling animations and transitions
 */
export async function preparePageForVisualTest(page: Page) {
  // Set a consistent viewport size
  await page.setViewportSize(VIEWPORT_SIZES.desktop);
  
  // Disable animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `
  });
}

/**
 * Test different component states for visual regression
 */
export async function testComponentStates(page: Page, testName: string, states: { name: string; setup: () => Promise<void> }[]) {
  for (const state of states) {
    await state.setup();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow for any dynamic content to settle
    await compareScreenshots(page, `${testName}-${state.name}`);
  }
}

/**
 * Test responsive layouts at different viewport sizes
 */
export async function testResponsiveLayouts(page: Page, testName: string, callback: (viewport: { width: number; height: number }) => Promise<void>) {
  for (const [size, viewport] of Object.entries(VIEWPORT_SIZES)) {
    await callback(viewport);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Allow for any dynamic content to settle
    await compareScreenshots(page, `${testName}-${size}`);
  }
}

/**
 * Compare screenshots with a maximum allowed difference
 */
export async function compareScreenshots(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    animations: 'disabled',
    timeout: DEFAULT_TIMEOUT,
    maxDiffPixelRatio: 0.1
  });
}

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

/**
 * Helper function to wait for element with increased timeout
 */
export async function waitForElement(page: Page, selector: string, options = { timeout: DEFAULT_TIMEOUT }) {
  await page.waitForSelector(selector, { 
    state: 'visible',
    timeout: options.timeout
  });
}

/**
 * Helper function to ensure page is ready for testing
 */
export async function ensurePageReady(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Additional settling time
}

export interface Viewport {
  width: number;
  height: number;
}

export interface TestSetup {
  name: string;
  setup: () => Promise<void>;
}

export const VIEWPORTS: Viewport[] = [
  { width: 375, height: 667 },  // Mobile
  { width: 768, height: 1024 }, // Tablet
  { width: 1280, height: 800 }, // Desktop
  { width: 1920, height: 1080 } // Large Desktop
];

export async function testResponsiveLayouts(
  page: Page,
  testName: string,
  callback: (viewport: Viewport) => Promise<void>
): Promise<void> {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    await callback(viewport);
  }
}

export async function waitForImagesLoaded(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const images = document.getElementsByTagName('img');
    return Array.from(images).every((img: HTMLImageElement) => img.complete);
  });
}

export async function setupTestEnvironment(page: Page): Promise<void> {
  // Add any common setup logic here
  await page.setViewportSize(VIEWPORTS[2]); // Default to desktop size
}

export const TEST_SETUPS: TestSetup[] = [
  {
    name: 'default',
    setup: async () => {
      // Default setup logic
    }
  },
  {
    name: 'authenticated',
    setup: async () => {
      // Authentication setup logic
    }
  }
];

export async function runVisualTest(
  page: Page,
  name: string,
  callback: () => Promise<void>
): Promise<void> {
  await setupTestEnvironment(page);
  await callback();
  await waitForImagesLoaded(page);
} 
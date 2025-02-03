import { test, expect } from '@playwright/test';
import {
  VIEWPORT_SIZES,
  preparePageForVisualTest,
  TestState,
  VisualTestOptions,
  runAccessibilityTest,
  AccessibilityResult
} from './utils/visual-test-utils';

/**
 * Visual regression tests for layout components and responsive behavior.
 * Tests the visual appearance and functionality of core layout elements across different viewports.
 * 
 * @packageDocumentation
 * 
 * @remarks
 * Test Coverage:
 * - Grid Layout:
 *   - Responsive grid system
 *   - Grid spacing and alignment
 *   - Content distribution
 * 
 * - Header Component:
 *   - Fixed positioning
 *   - Responsive navigation
 *   - Brand elements
 * 
 * - Footer Component:
 *   - Fixed positioning
 *   - Responsive behavior
 *   - Content alignment
 * 
 * - Navigation:
 *   - Mobile menu states
 *   - Desktop navigation
 *   - Menu transitions
 * 
 * - Accessibility:
 *   - ARIA landmarks
 *   - Navigation structure
 *   - Focus management
 */

interface Viewport {
  width: number;
  height: number;
}

test.describe('Layout Visual Tests', () => {
  /**
   * Setup before each test case
   * Navigates to homepage and ensures page is ready
   */
  test.beforeEach(async ({ page }): Promise<void> => {
    await page.goto('/');
  });

  /**
   * Tests grid layout responsiveness across different viewport sizes
   * Verifies spacing, alignment, and content distribution
   */
  test('should render grid layout correctly across viewports', async ({ page }): Promise<void> => {
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
      
      // Test accessibility for each viewport
      const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
      expect(accessibilityReport.violations).toEqual([]);
    }
  });

  /**
   * Tests header component rendering across different viewport sizes
   * Verifies fixed positioning and responsive behavior
   */
  test('should render header correctly across viewports', async ({ page }): Promise<void> => {
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
      
      // Test accessibility for each viewport
      const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
      expect(accessibilityReport.violations).toEqual([]);
    }
  });

  /**
   * Tests footer component rendering across different viewport sizes
   * Verifies fixed positioning and content alignment
   */
  test('should render footer correctly across viewports', async ({ page }): Promise<void> => {
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
      
      // Test accessibility for each viewport
      const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
      expect(accessibilityReport.violations).toEqual([]);
    }
  });

  /**
   * Tests responsive navigation menu behavior
   * Verifies mobile and desktop states, including menu transitions
   */
  test('should handle responsive navigation menu', async ({ page }): Promise<void> => {
    const states: TestState[] = [
      {
        name: 'mobile-closed',
        async setup(): Promise<void> {
          await page.setViewportSize(VIEWPORT_SIZES.mobile as Viewport);
        },
      },
      {
        name: 'mobile-open',
        async setup(): Promise<void> {
          await page.setViewportSize(VIEWPORT_SIZES.mobile as Viewport);
          await page.click('[data-testid="menu-button"]');
          await page.waitForTimeout(300); // Wait for menu animation
        },
      },
      {
        name: 'desktop',
        async setup(): Promise<void> {
          await page.setViewportSize(VIEWPORT_SIZES.desktop as Viewport);
        },
      },
    ];

    await preparePageForVisualTest(page);
    await testComponentStates(page, '[data-testid="navigation"]', states);
    await expect(page).toHaveScreenshot('navigation-states.png');
    
    // Test accessibility in each navigation state
    const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
    expect(accessibilityReport.violations).toEqual([]);
  });
});

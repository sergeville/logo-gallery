import { test, expect } from '@playwright/test';
import { 
  preparePageForVisualTest, 
  testComponentStates, 
  VIEWPORT_SIZES, 
  runAccessibilityTest,
  TestState,
  AccessibilityResult 
} from './utils/visual-test-utils';

/**
 * Visual regression tests for import paths functionality
 * Tests various states and responsive layouts of the import feature
 * 
 * @remarks
 * These tests cover:
 * - Default state rendering
 * - Loading state during import operations
 * - Error state with invalid paths
 * - Empty state with cleared storage
 * - Responsive layouts across different viewport sizes
 * - Accessibility compliance
 */
test.describe('Import Paths Visual Tests', () => {
  test.beforeEach(async ({ page }): Promise<void> => {
    await page.goto('/import');
    await preparePageForVisualTest(page);
  });

  /**
   * Tests the visual appearance of the import dialog in various states
   * Includes responsive layout testing and accessibility checks
   */
  test('import dialog visual states', async ({ page }): Promise<void> => {
    const states: TestState[] = [
      {
        name: 'default',
        setup: async (): Promise<void> => {
          await page.goto('/import');
        }
      },
      {
        name: 'loading',
        setup: async (): Promise<void> => {
          await page.goto('/import');
          await page.getByRole('button', { name: 'Import' }).click();
        }
      },
      {
        name: 'error',
        setup: async (): Promise<void> => {
          await page.goto('/import');
          await page.getByPlaceholder('Import path').fill('invalid/path');
          await page.getByRole('button', { name: 'Import' }).click();
        }
      },
      {
        name: 'empty',
        setup: async (): Promise<void> => {
          await page.goto('/import');
          await page.evaluate((): void => {
            localStorage.clear();
            sessionStorage.clear();
          });
        }
      }
    ];

    // Test component states
    await testComponentStates(page, '[data-testid="import-dialog"]', states);

    // Test responsive layouts
    for (const [device, viewport] of Object.entries(VIEWPORT_SIZES)) {
      await page.setViewportSize(viewport);
      await expect(page).toHaveScreenshot(`import-dialog-${device}.png`);
    }

    // Test accessibility
    const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
    expect(accessibilityReport.violations).toEqual([]);
  });
});


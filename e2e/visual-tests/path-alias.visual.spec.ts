import { test, expect } from '@playwright/test';
import { 
  preparePageForVisualTest,
  runAccessibilityTest,
  AccessibilityResult 
} from '@/e2e/visual-tests/utils/visual-test-utils';

/**
 * Visual regression and functionality tests for path alias implementation.
 * Validates that components, services, and utilities using path aliases (@) load correctly.
 * 
 * @packageDocumentation
 * 
 * @remarks
 * Test Coverage:
 * - Component Loading:
 *   - Static components with path aliases
 *   - Dynamic imports with path aliases
 *   - Error boundary components
 * 
 * - Service Integration:
 *   - API endpoints using aliased imports
 *   - Middleware chain validation
 *   - Configuration loading
 * 
 * - Type System:
 *   - Type imports with aliases
 *   - Runtime type validation
 * 
 * - Error Handling:
 *   - Error boundary activation
 *   - Error message display
 */
test.describe('Path Alias Validation', () => {
  /**
   * Setup before each test case
   * Prepares the page for visual testing
   */
  test.beforeEach(async ({ page }): Promise<void> => {
    await preparePageForVisualTest(page);
  });

  /**
   * Tests loading of components using @ path aliases
   * Verifies core components are rendered correctly
   */
  test('should load components with @ path aliases', async ({ page }): Promise<void> => {
    await page.goto('/');

    // Verify components are loaded correctly
    await expect(page.locator('[data-testid="logo-gallery"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible({ timeout: 30000 });

    // Test accessibility
    const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
    expect(accessibilityReport.violations).toEqual([]);
  });

  /**
   * Tests dynamic imports using @ path aliases
   * Verifies lazy-loaded components render properly
   */
  test('should handle dynamic imports with @ aliases', async ({ page }): Promise<void> => {
    await page.goto('/gallery');

    // Verify lazy-loaded components
    await expect(page.locator('[data-testid="gallery-grid"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible({ timeout: 30000 });

    // Test accessibility
    const accessibilityReport: AccessibilityResult = await runAccessibilityTest(page);
    expect(accessibilityReport.violations).toEqual([]);
  });

  /**
   * Tests service imports using @ path aliases
   * Verifies API endpoints function correctly
   */
  test('should validate service imports with @ aliases', async ({ request }): Promise<void> => {
    // Test endpoints that use services with @ imports
    const endpoints = [
      '/api/images/sample-logo.png',
      '/api/logos/sample-logo.png',
      '/api/cache/status',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(200);
    }
  });

  /**
   * Tests middleware chain using @ path aliases
   * Verifies all middleware components are executed
   */
  test('should verify middleware chain with @ imports', async ({ request }): Promise<void> => {
    const response = await request.get('/api/protected/resource');

    // Verify all middleware in the chain is executed
    const headers = response.headers();
    expect(headers['x-middleware-cache']).toBeDefined();
    expect(headers['x-middleware-auth']).toBeDefined();
  });

  /**
   * Tests utility imports using @ path aliases
   * Verifies error handling components work correctly
   */
  test('should handle utility imports with @ aliases', async ({ page }): Promise<void> => {
    await page.goto('/gallery');

    // Trigger error to verify error handling utilities
    await page.route('**/api/images/**', route => route.abort());
    await page.reload();

    // Verify error handling components are loaded
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 30000 });
  });

  /**
   * Tests type imports using @ path aliases
   * Verifies runtime type validation works
   */
  test('should validate type imports with @ aliases', async ({ request }): Promise<void> => {
    const response = await request.post('/api/validate', {
      data: {
        name: 'Sample Logo',
        url: 'https://example.com/logo.png',
      },
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.validated).toBe(true);
  });

  /**
   * Tests configuration imports using @ path aliases
   * Verifies config loading and structure
   */
  test('should verify configuration imports with @ aliases', async ({ request }): Promise<void> => {
    const response = await request.get('/api/config');
    expect(response.status()).toBe(200);

    const config = await response.json();
    expect(config.env).toBeDefined();
    expect(config.mongodb).toBeDefined();
    expect(config.server).toBeDefined();
  });
});

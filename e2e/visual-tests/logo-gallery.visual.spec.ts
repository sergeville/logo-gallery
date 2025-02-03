import { test, expect } from '@playwright/test';
import { 
  preparePageForVisualTest,
  VIEWPORT_SIZES
} from './utils/visual-test-utils';

/**
 * Visual regression tests for the Logo Gallery application.
 * Tests the visual appearance and functionality of the main logo gallery features.
 * 
 * @packageDocumentation
 * 
 * @remarks
 * Test Coverage:
 * - Core Features:
 *   - Homepage layout and content
 *   - Logo grid display and filtering
 *   - Logo detail view
 *   - Search functionality
 * 
 * - Responsive Design:
 *   - Mobile navigation
 *   - Mobile search
 *   - Responsive layouts
 * 
 * - Theme Support:
 *   - Light mode (default)
 *   - Dark mode
 * 
 * - Authentication:
 *   - Login modal
 *   - Registration modal
 */
test.describe('Logo Gallery Visual Tests', () => {
  /**
   * Setup before each test case
   * Navigates to homepage and ensures page is fully loaded
   */
  test.beforeEach(async ({ page }): Promise<void> => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  });

  /**
   * Tests the homepage layout and content rendering
   * Verifies main content area and image loading
   */
  test('homepage layout', async ({ page }): Promise<void> => {
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="main-content"]'],
      customStyles: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `,
    });

    // Ensure all images are loaded
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('img');
      return (
        images.length > 0 &&
        Array.from(images).every(img => {
          const imgElement = img as HTMLImageElement;
          return imgElement.complete;
        })
      );
    });

    await expect(page).toHaveScreenshot('homepage.png');
  });

  /**
   * Tests the logo grid layout and filtering functionality
   * Verifies grid rendering, image loading, and filter panel
   */
  test('logo grid layout', async ({ page }): Promise<void> => {
    await page.goto('/logos');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="gallery-container"]', '[data-testid="logo-card"]'],
    });

    // Ensure all images in the grid are loaded
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('[data-testid="logo-image"]');
      return (
        images.length > 0 &&
        Array.from(images).every(img => {
          const imgElement = img as HTMLImageElement;
          return imgElement.complete;
        })
      );
    });

    await expect(page).toHaveScreenshot('logo-grid.png');

    // Test filter view
    const filterButton = page.locator('[data-testid="filter-button"]');
    await filterButton.waitFor();
    await filterButton.click();
    await page.waitForTimeout(500); // Wait for animation
    await expect(page).toHaveScreenshot('logo-grid-filter-open.png');
  });

  /**
   * Tests the logo detail view functionality
   * Verifies individual logo display and image loading
   */
  test('logo detail view', async ({ page }): Promise<void> => {
    await page.goto('/logos');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="gallery-container"]', '[data-testid="logo-card"]'],
    });

    const firstLogo = page.locator('[data-testid="logo-card"]').first();
    await firstLogo.waitFor({ state: 'visible' });
    await firstLogo.click();

    await page.waitForLoadState('networkidle');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="main-content"]', '[data-testid="logo-image"]'],
    });

    await page.waitForFunction(() => {
      const img = document.querySelector('[data-testid="logo-image"]');
      return img && (img as HTMLImageElement).complete;
    });

    await expect(page).toHaveScreenshot('logo-detail.png');
  });

  /**
   * Tests dark mode appearance
   * Verifies theme switching and styling
   */
  test('dark mode layout', async ({ page }): Promise<void> => {
    await page.goto('/logos');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="theme-toggle"]'],
    });

    // Toggle dark mode
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500); // Wait for theme transition

    await expect(page).toHaveScreenshot('logo-grid-dark-mode.png');
  });

  /**
   * Tests mobile navigation and responsive layout
   * Verifies menu and search functionality on mobile
   */
  test('mobile navigation', async ({ page }): Promise<void> => {
    await page.setViewportSize(VIEWPORT_SIZES.mobile);
    await page.goto('/');
    await preparePageForVisualTest(page);

    // Test mobile menu
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await menuButton.waitFor();
    await menuButton.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('mobile-nav-menu-open.png');

    // Test mobile search
    const searchButton = page.locator('[data-testid="mobile-search-button"]');
    await searchButton.waitFor();
    await searchButton.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('mobile-nav-search-open.png');
  });

  /**
   * Tests search functionality
   * Verifies search results and empty state handling
   */
  test('search functionality', async ({ page }): Promise<void> => {
    await page.goto('/logos');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="search-input"]'],
    });

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('logo-grid-search-results.png');

    // Test empty search results
    await searchInput.fill('nonexistentlogo123456');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('logo-grid-empty-search.png');
  });

  /**
   * Tests authentication modal
   * Verifies login and registration views
   */
  test('authentication modal', async ({ page }): Promise<void> => {
    await page.goto('/');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="login-button"]'],
    });

    await page.locator('[data-testid="login-button"]').click();
    await page.waitForSelector('[data-testid="auth-modal"]');
    await expect(page).toHaveScreenshot('auth-modal-login.png');

    // Test register view
    const registerTab = page.locator('[data-testid="register-tab"]');
    await registerTab.waitFor();
    await registerTab.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('auth-modal-register.png');
  });
});

import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from './utils/visual-test-utils';

test.describe('Logo Gallery Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  });

  test('homepage layout', async ({ page }) => {
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

  test('logo grid layout', async ({ page }) => {
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

    // Test filter view if available
    const filterButton = page.locator('[data-testid="filter-button"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500); // Wait for animation
      await expect(page).toHaveScreenshot('logo-grid-filter-open.png');
    }
  });

  test('logo detail view', async ({ page }) => {
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

  test('dark mode layout', async ({ page }) => {
    await page.goto('/logos');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="theme-toggle"]'],
    });

    // Toggle dark mode
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500); // Wait for theme transition

    await expect(page).toHaveScreenshot('logo-grid-dark-mode.png');
  });

  test('mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await preparePageForVisualTest(page);

    // Test mobile menu
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('mobile-nav-menu-open.png');
    }

    // Test mobile search
    const searchButton = page.locator('[data-testid="mobile-search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('mobile-nav-search-open.png');
    }
  });

  test('search functionality', async ({ page }) => {
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

  test('authentication modal', async ({ page }) => {
    await page.goto('/');
    await preparePageForVisualTest(page, {
      waitForSelectors: ['[data-testid="login-button"]'],
    });

    await page.locator('[data-testid="login-button"]').click();
    await page.waitForSelector('[data-testid="auth-modal"]');

    await expect(page).toHaveScreenshot('auth-modal-login.png');

    // Test register view if available
    const registerTab = page.locator('[data-testid="register-tab"]');
    if (await registerTab.isVisible()) {
      await registerTab.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('auth-modal-register.png');
    }
  });
});

import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Logo Gallery Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Load authentication state before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  });

  test('homepage visual test', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for main content and images with increased timeout
    await page.waitForSelector('[data-testid="main-content"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    // Ensure all images are loaded
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).every(img => img.complete);
    });

    await percySnapshot(page, 'Homepage');
  });

  test('logo grid visual test', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for gallery container
    await page.waitForSelector('[data-testid="gallery-container"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    // Wait for at least one logo card
    await page.waitForSelector('[data-testid="logo-card"]', { 
      state: 'visible',
      timeout: 30000 
    });

    // Ensure all images in the grid are loaded
    await page.waitForFunction(() => {
      const images = document.querySelectorAll('[data-testid="logo-image"]');
      return images.length > 0 && Array.from(images).every(img => img.complete);
    });

    await percySnapshot(page, 'Logo Grid');

    // Test filter view if available
    const filterButton = page.locator('[data-testid="filter-button"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500); // Wait for animation
      await percySnapshot(page, 'Logo Grid - Filter Open');
    }
  });

  test('logo detail visual test', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for gallery container and first logo
    await page.waitForSelector('[data-testid="gallery-container"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    const firstLogo = await page.locator('[data-testid="logo-card"]').first();
    await firstLogo.waitFor({ state: 'visible', timeout: 30000 });
    await firstLogo.click();
    
    await page.waitForLoadState('networkidle');
    
    // Wait for detail view content
    await page.waitForSelector('[data-testid="main-content"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    // Ensure logo image is loaded
    await page.waitForSelector('[data-testid="logo-image"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    await page.waitForFunction(() => {
      const img = document.querySelector('[data-testid="logo-image"]');
      return img && (img as HTMLImageElement).complete;
    });

    await percySnapshot(page, 'Logo Detail');
  });

  test('dark mode visual test', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for theme toggle
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await themeToggle.waitFor({ state: 'visible', timeout: 30000 });
    
    // Toggle dark mode
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for theme transition
    
    // Wait for logo grid in dark mode
    await page.waitForSelector('[data-testid="gallery-container"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    await percySnapshot(page, 'Logo Grid - Dark Mode');
  });

  test('mobile navigation visual test', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Wait for animation
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Mobile Navigation - Menu Open');
    }

    // Test mobile search
    const searchButton = page.locator('[data-testid="mobile-search-button"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Mobile Navigation - Search Open');
    }
  });

  test('search functionality', async ({ page }) => {
    await page.goto('/logos');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.waitFor({ state: 'visible', timeout: 30000 });
    
    await searchInput.fill('test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Wait for search results
    
    await percySnapshot(page, 'Logo Grid - Search Results');

    // Test empty search results
    await searchInput.fill('nonexistentlogo123456');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await percySnapshot(page, 'Logo Grid - Empty Search Results');
  });

  test('authentication flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for login button
    const loginButton = page.locator('[data-testid="login-button"]');
    await loginButton.waitFor({ state: 'visible', timeout: 30000 });
    
    await loginButton.click();
    
    // Wait for auth modal
    await page.waitForSelector('[data-testid="auth-modal"]', { 
      state: 'visible',
      timeout: 30000 
    });
    
    await percySnapshot(page, 'Login Modal');

    // Test register view if available
    const registerTab = page.locator('[data-testid="register-tab"]');
    if (await registerTab.isVisible()) {
      await registerTab.click();
      await page.waitForTimeout(500); // Wait for tab switch animation
      await percySnapshot(page, 'Register Modal');
    }
  });
}); 
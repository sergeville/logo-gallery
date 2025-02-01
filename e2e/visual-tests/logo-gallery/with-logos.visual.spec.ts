import { test, expect } from '@playwright/test';
import { setupVisualTest } from '../utils/test-setup';

test.describe('Logo Gallery - With Logos', () => {
  test.beforeEach(async ({ page }) => {
    await setupVisualTest(page);
  });

  test('should display grid of logos', async ({ page }) => {
    // Navigate to gallery with logos
    await page.goto('/gallery');
    
    // Wait for logos to load
    await page.waitForSelector('[data-testid="logo-grid"]');
    await page.waitForSelector('[data-testid="logo-card"]');
    
    // Take a screenshot of the gallery with logos
    await expect(page).toHaveScreenshot('logo-grid.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')]
    });
  });

  test('should display grid of logos in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Navigate to gallery with logos
    await page.goto('/gallery');
    
    // Wait for logos to load
    await page.waitForSelector('[data-testid="logo-grid"]');
    await page.waitForSelector('[data-testid="logo-card"]');
    
    // Take a screenshot of the gallery with logos in dark mode
    await expect(page).toHaveScreenshot('logo-grid-dark.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')]
    });
  });

  test('should handle logo hover state', async ({ page }) => {
    // Navigate to gallery with logos
    await page.goto('/gallery');
    
    // Wait for logos to load
    await page.waitForSelector('[data-testid="logo-card"]');
    
    // Hover over the first logo
    await page.hover('[data-testid="logo-card"]:first-child');
    
    // Take a screenshot of the hovered state
    await expect(page).toHaveScreenshot('logo-hover.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')]
    });
  });

  test('should handle logo selection', async ({ page }) => {
    // Navigate to gallery with logos
    await page.goto('/gallery');
    
    // Wait for logos to load
    await page.waitForSelector('[data-testid="logo-card"]');
    
    // Click the first logo
    await page.click('[data-testid="logo-card"]:first-child');
    
    // Wait for selection UI to update
    await page.waitForSelector('[data-testid="logo-card"].selected');
    
    // Take a screenshot of the selected state
    await expect(page).toHaveScreenshot('logo-selected.png', {
      animations: 'disabled',
      mask: [page.locator('time'), page.locator('[data-testid="user-avatar"]')]
    });
  });
}); 
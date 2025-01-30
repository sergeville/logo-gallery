import { test, expect } from '@playwright/test';

test.describe('Image Gallery E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  test('should load and display images', async ({ page }) => {
    // Wait for images to load
    await page.waitForSelector('[data-testid="gallery-image"]');
    
    // Check if images are visible
    const images = await page.$$('[data-testid="gallery-image"]');
    expect(images.length).toBeGreaterThan(0);

    // Check if images are actually loaded
    for (const image of images) {
      const naturalWidth = await image.evaluate(img => (img as HTMLImageElement).naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should lazy load images', async ({ page }) => {
    // Initial visible images
    const initialImages = await page.$$('[data-testid="gallery-image"]');
    const initialCount = initialImages.length;

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for new images
    await page.waitForFunction(
      (count) => document.querySelectorAll('[data-testid="gallery-image"]').length > count,
      initialCount
    );

    // Verify more images loaded
    const newImages = await page.$$('[data-testid="gallery-image"]');
    expect(newImages.length).toBeGreaterThan(initialCount);
  });

  test('should show loading states', async ({ page }) => {
    // Slow down network
    await page.route('**/*.{png,jpg,webp}', route => 
      route.continue({ delay: 500 })
    );

    await page.reload();

    // Check for loading skeleton
    const skeleton = await page.waitForSelector('[data-testid="image-skeleton"]');
    expect(await skeleton.isVisible()).toBe(true);

    // Wait for images to load
    await page.waitForSelector('[data-testid="gallery-image"]');
    
    // Verify skeleton is hidden
    expect(await skeleton.isVisible()).toBe(false);
  });

  test('should handle image errors', async ({ page }) => {
    // Mock failed image loads
    await page.route('**/*.{png,jpg,webp}', route => route.abort());

    await page.reload();

    // Check for error state
    const errorElements = await page.$$('[data-testid="image-error"]');
    expect(errorElements.length).toBeGreaterThan(0);
  });

  test('should optimize images for viewport', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();

      // Wait for images to load
      await page.waitForSelector('[data-testid="gallery-image"]');

      // Check image sources
      const imageSources = await page.evaluate(() => {
        const images = document.querySelectorAll('[data-testid="gallery-image"]');
        return Array.from(images).map(img => (img as HTMLImageElement).currentSrc);
      });

      // Verify appropriate image sizes are loaded
      for (const src of imageSources) {
        if (viewport.width <= 375) {
          expect(src).toContain('size=small');
        } else if (viewport.width <= 768) {
          expect(src).toContain('size=medium');
        } else {
          expect(src).toContain('size=large');
        }
      }
    }
  });

  test('should handle offline mode', async ({ page }) => {
    // Load gallery and wait for images
    await page.waitForSelector('[data-testid="gallery-image"]');

    // Go offline
    await page.context().setOffline(true);

    // Reload page
    await page.reload();

    // Check if cached images are displayed
    const images = await page.$$('[data-testid="gallery-image"]');
    expect(images.length).toBeGreaterThan(0);

    // Check offline indicator
    const offlineIndicator = await page.getByText('Offline Mode');
    expect(await offlineIndicator.isVisible()).toBe(true);
  });

  test('should handle image upload', async ({ page }) => {
    // Click upload button
    await page.click('[data-testid="upload-button"]');

    // Upload test image
    await page.setInputFiles('input[type="file"]', {
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });

    // Wait for upload progress
    const progressBar = await page.waitForSelector('[data-testid="upload-progress"]');
    expect(await progressBar.isVisible()).toBe(true);

    // Wait for upload completion
    await page.waitForSelector('[data-testid="upload-success"]');

    // Verify new image appears in gallery
    const newImage = await page.waitForSelector('[alt="test-image.jpg"]');
    expect(await newImage.isVisible()).toBe(true);
  });
}); 
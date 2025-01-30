import { test, expect } from '@playwright/test';
import { preparePageForVisualTest } from '@/e2e/utils/visual-test-utils';

test.describe('Path Alias Validation', () => {
  test.beforeEach(async ({ page }) => {
    await preparePageForVisualTest(page);
  });

  test('should load components with @ path aliases', async ({ page }) => {
    await page.goto('/');
    
    // Verify components are loaded correctly
    await expect(page.locator('[data-testid="logo-gallery"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible({ timeout: 30000 });
  });

  test('should handle dynamic imports with @ aliases', async ({ page }) => {
    await page.goto('/gallery');
    
    // Verify lazy-loaded components
    await expect(page.locator('[data-testid="gallery-grid"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible({ timeout: 30000 });
  });

  test('should validate service imports with @ aliases', async ({ request }) => {
    // Test endpoints that use services with @ imports
    const endpoints = [
      '/api/images/sample-logo.png',
      '/api/logos/sample-logo.png',
      '/api/cache/status'
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(200);
    }
  });

  test('should verify middleware chain with @ imports', async ({ request }) => {
    const response = await request.get('/api/protected/resource');
    
    // Verify all middleware in the chain is executed
    const headers = response.headers();
    expect(headers['x-middleware-cache']).toBeDefined();
    expect(headers['x-middleware-auth']).toBeDefined();
  });

  test('should handle utility imports with @ aliases', async ({ page }) => {
    await page.goto('/gallery');
    
    // Trigger error to verify error handling utilities
    await page.route('**/api/images/**', route => route.abort());
    await page.reload();
    
    // Verify error handling components are loaded
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 30000 });
  });

  test('should validate type imports with @ aliases', async ({ request }) => {
    const response = await request.post('/api/validate', {
      data: {
        name: 'Sample Logo',
        url: 'https://example.com/logo.png'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.validated).toBe(true);
  });

  test('should verify configuration imports with @ aliases', async ({ request }) => {
    const response = await request.get('/api/config');
    expect(response.status()).toBe(200);

    const config = await response.json();
    expect(config.env).toBeDefined();
    expect(config.mongodb).toBeDefined();
    expect(config.server).toBeDefined();
  });
}); 
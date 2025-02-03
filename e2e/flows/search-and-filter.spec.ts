import { test, expect } from '@playwright/test';
import { registerNewUser, uploadLogo, cleanupTestUser } from '../utils/test-utils';
import path from 'path';

test.describe('Search and Filter Flow', () => {
  test('should allow searching and filtering logos', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const logoPath = path.join(__dirname, '../fixtures/test-logo.png');
    const logos = [
      { title: 'Tech Logo 2024', tags: ['technology', 'modern'] },
      { title: 'Nature Brand', tags: ['nature', 'organic'] },
      { title: 'Sports Team', tags: ['sports', 'dynamic'] }
    ];

    try {
      // Setup: Register and upload multiple logos
      await registerNewUser(page, testEmail, testPassword);
      
      for (const logo of logos) {
        await uploadLogo(page, logoPath, logo.title);
        // Add tags
        await page.getByRole('button', { name: /add tags/i }).click();
        for (const tag of logo.tags) {
          await page.getByRole('textbox', { name: /tag/i }).fill(tag);
          await page.getByRole('button', { name: /add/i }).click();
        }
        await page.getByRole('button', { name: /save/i }).click();
      }

      // Test search functionality
      await page.goto('/gallery');
      
      // Search by title
      await page.getByRole('textbox', { name: /search/i }).fill('Tech');
      await expect(page.getByText('Tech Logo 2024')).toBeVisible();
      await expect(page.getByText('Nature Brand')).not.toBeVisible();

      // Clear search
      await page.getByRole('textbox', { name: /search/i }).clear();

      // Filter by tag
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByRole('checkbox', { name: /nature/i }).check();
      await expect(page.getByText('Nature Brand')).toBeVisible();
      await expect(page.getByText('Tech Logo 2024')).not.toBeVisible();

      // Test multiple tag selection
      await page.getByRole('checkbox', { name: /sports/i }).check();
      await expect(page.getByText('Nature Brand')).toBeVisible();
      await expect(page.getByText('Sports Team')).toBeVisible();
      await expect(page.getByText('Tech Logo 2024')).not.toBeVisible();

      // Sort by date
      await page.getByRole('button', { name: /sort/i }).click();
      await page.getByRole('option', { name: /newest/i }).click();
      
      // Verify sort order
      const titles = await page.getByTestId('logo-title').allTextContents();
      expect(titles).toEqual(['Sports Team', 'Nature Brand', 'Tech Logo 2024'].reverse());

    } finally {
      // Cleanup: Delete test user
      await cleanupTestUser(page);
    }
  });

  test('should handle no search results gracefully', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const logoPath = path.join(__dirname, '../fixtures/test-logo.png');
    
    try {
      // Setup: Register and upload one logo
      await registerNewUser(page, testEmail, testPassword);
      await uploadLogo(page, logoPath, 'Test Logo');

      // Search for non-existent logo
      await page.goto('/gallery');
      await page.getByRole('textbox', { name: /search/i }).fill('NonExistent');
      
      // Verify no results message
      await expect(page.getByText(/no logos found/i)).toBeVisible();
      await expect(page.getByText('Test Logo')).not.toBeVisible();

      // Verify clear search works
      await page.getByRole('button', { name: /clear/i }).click();
      await expect(page.getByText('Test Logo')).toBeVisible();

    } finally {
      // Cleanup: Delete test user
      await cleanupTestUser(page);
    }
  });
}); 
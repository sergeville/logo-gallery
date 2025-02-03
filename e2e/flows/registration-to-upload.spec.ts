import { test, expect } from '@playwright/test';
import { registerNewUser, uploadLogo, cleanupTestUser } from '../utils/test-utils';
import path from 'path';

test.describe('Registration to Logo Upload Flow', () => {
  test('should allow a new user to register and upload a logo', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const logoTitle = 'My Test Logo';
    const logoPath = path.join(__dirname, '../fixtures/test-logo.png');

    try {
      // Step 1: Register new user
      await registerNewUser(page, testEmail, testPassword);
      await expect(page.getByText(/welcome/i)).toBeVisible();

      // Step 2: Navigate to My Logos and verify empty state
      await page.goto('/my-logos');
      await expect(page.getByText(/no logos yet/i)).toBeVisible();

      // Step 3: Upload a logo
      await uploadLogo(page, logoPath, logoTitle);

      // Step 4: Verify logo appears in my logos
      await page.goto('/my-logos');
      await expect(page.getByText(logoTitle)).toBeVisible();

      // Step 5: Verify logo appears in gallery
      await page.goto('/gallery');
      await expect(page.getByText(logoTitle)).toBeVisible();

      // Step 6: Check logo detail page
      await page.getByText(logoTitle).click();
      await expect(page.getByRole('heading', { name: logoTitle })).toBeVisible();
      
    } finally {
      // Cleanup: Delete test user
      await cleanupTestUser(page);
    }
  });

  test('should handle invalid logo upload attempts', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const invalidFilePath = path.join(__dirname, '../fixtures/invalid.txt');

    try {
      // Register new user
      await registerNewUser(page, testEmail, testPassword);

      // Try to upload invalid file
      await page.goto('/my-logos');
      await page.getByRole('button', { name: /upload/i }).click();
      await page.setInputFiles('input[type="file"]', invalidFilePath);
      
      // Verify error message
      await expect(page.getByText(/invalid file type/i)).toBeVisible();

      // Verify no logo was uploaded
      await page.goto('/my-logos');
      await expect(page.getByText(/no logos yet/i)).toBeVisible();

    } finally {
      // Cleanup: Delete test user
      await cleanupTestUser(page);
    }
  });

  test('should enforce logo upload size limits', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const largePath = path.join(__dirname, '../fixtures/too-large.png');

    try {
      // Register new user
      await registerNewUser(page, testEmail, testPassword);

      // Try to upload large file
      await page.goto('/my-logos');
      await page.getByRole('button', { name: /upload/i }).click();
      await page.setInputFiles('input[type="file"]', largePath);
      
      // Verify error message
      await expect(page.getByText(/file size too large/i)).toBeVisible();

      // Verify no logo was uploaded
      await page.goto('/my-logos');
      await expect(page.getByText(/no logos yet/i)).toBeVisible();

    } finally {
      // Cleanup: Delete test user
      await cleanupTestUser(page);
    }
  });
}); 
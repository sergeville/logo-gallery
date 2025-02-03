import { test, expect } from '@playwright/test';
import { registerNewUser, loginUser, cleanupTestUser } from '../utils/test-utils';

test.describe('Profile Management Flow', () => {
  test('should allow updating profile information', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const newUsername = 'TestUser2024';
    const newBio = 'This is my updated bio';

    try {
      // Register new user
      await registerNewUser(page, testEmail, testPassword);

      // Navigate to profile settings
      await page.goto('/settings');
      
      // Update profile information
      await page.getByLabel(/username/i).fill(newUsername);
      await page.getByLabel(/bio/i).fill(newBio);
      await page.getByRole('button', { name: /save changes/i }).click();

      // Verify success message
      await expect(page.getByText(/profile updated/i)).toBeVisible();

      // Verify changes persist after reload
      await page.reload();
      await expect(page.getByLabel(/username/i)).toHaveValue(newUsername);
      await expect(page.getByLabel(/bio/i)).toHaveValue(newBio);

      // Verify changes appear on public profile
      await page.goto('/profile');
      await expect(page.getByText(newUsername)).toBeVisible();
      await expect(page.getByText(newBio)).toBeVisible();

    } finally {
      // Cleanup
      await cleanupTestUser(page);
    }
  });

  test('should handle password changes securely', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const newPassword = 'NewTest456!@#';

    try {
      // Register new user
      await registerNewUser(page, testEmail, testPassword);

      // Navigate to security settings
      await page.goto('/settings/security');
      
      // Change password
      await page.getByLabel(/current password/i).fill(testPassword);
      await page.getByLabel(/new password/i).fill(newPassword);
      await page.getByLabel(/confirm password/i).fill(newPassword);
      await page.getByRole('button', { name: /change password/i }).click();

      // Verify success message
      await expect(page.getByText(/password updated/i)).toBeVisible();

      // Logout
      await page.getByRole('button', { name: /logout/i }).click();

      // Try logging in with old password (should fail)
      await loginUser(page, testEmail, testPassword);
      await expect(page.getByText(/invalid credentials/i)).toBeVisible();

      // Login with new password (should succeed)
      await loginUser(page, testEmail, newPassword);
      await expect(page).toHaveURL('/');

    } finally {
      // Cleanup
      await cleanupTestUser(page);
    }
  });

  test('should handle account deletion', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    // Register new user
    await registerNewUser(page, testEmail, testPassword);

    // Navigate to account settings
    await page.goto('/settings/account');
    
    // Delete account
    await page.getByRole('button', { name: /delete account/i }).click();
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByRole('button', { name: /confirm deletion/i }).click();

    // Verify redirect to login page
    await expect(page).toHaveURL('/auth/signin');

    // Try logging in (should fail)
    await loginUser(page, testEmail, testPassword);
    await expect(page.getByText(/account not found/i)).toBeVisible();
  });

  test('should enforce password requirements', async ({ page }) => {
    // Test data
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const weakPassword = '123456';

    try {
      // Register new user
      await registerNewUser(page, testEmail, testPassword);

      // Navigate to security settings
      await page.goto('/settings/security');
      
      // Try changing to weak password
      await page.getByLabel(/current password/i).fill(testPassword);
      await page.getByLabel(/new password/i).fill(weakPassword);
      await page.getByLabel(/confirm password/i).fill(weakPassword);
      await page.getByRole('button', { name: /change password/i }).click();

      // Verify error message
      await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
      await expect(page.getByText(/password must include a number/i)).toBeVisible();
      await expect(page.getByText(/password must include a special character/i)).toBeVisible();

    } finally {
      // Cleanup
      await cleanupTestUser(page);
    }
  });
}); 
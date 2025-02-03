import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

test.describe('Settings Page', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!',
    name: `Test User ${Date.now()}`
  };

  test.beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name
      }
    });
  });

  test.afterAll(async () => {
    // Clean up test user
    await prisma.user.delete({
      where: { email: testUser.email }
    });
  });

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL('/auth/signin?callbackUrl=/settings');
  });

  test('shows settings form when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Account Settings');
    await expect(page.locator('#name')).toHaveValue(testUser.name);
    await expect(page.locator('#email')).toHaveValue(testUser.email);
  });

  test('updates user name', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    const newName = `Updated Name ${Date.now()}`;
    await page.fill('#name', newName);
    await page.fill('#currentPassword', testUser.password);
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('text=Settings updated successfully')).toBeVisible();

    // Verify database update
    const user = await prisma.user.findUnique({
      where: { email: testUser.email }
    });
    expect(user?.name).toBe(newName);
  });

  test('requires current password for changing password', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await page.fill('#newPassword', 'NewPassword123!');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Current password is required')).toBeVisible();
  });

  test('validates current password', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await page.fill('#currentPassword', 'WrongPassword123!');
    await page.fill('#newPassword', 'NewPassword123!');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid current password')).toBeVisible();
  });

  test('prevents using existing email', async ({ page }) => {
    // Create another user
    const otherUser = {
      email: `other_${Date.now()}@example.com`,
      password: 'Test123!',
      name: 'Other User'
    };
    const hashedPassword = await bcrypt.hash(otherUser.password, 10);
    await prisma.user.create({
      data: {
        email: otherUser.email,
        password: hashedPassword,
        name: otherUser.name
      }
    });

    // Login as test user
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Try to use other user's email
    await page.goto('/settings');
    await page.fill('#email', otherUser.email);
    await page.fill('#currentPassword', testUser.password);
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Email already in use')).toBeVisible();

    // Clean up other user
    await prisma.user.delete({
      where: { email: otherUser.email }
    });
  });

  test('validates password confirmation match', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await page.fill('#currentPassword', testUser.password);
    await page.fill('#newPassword', 'NewPassword123!');
    await page.fill('#confirmPassword', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=New password and confirmation do not match')).toBeVisible();
  });

  test('validates password length requirement', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await page.fill('#currentPassword', testUser.password);
    await page.fill('#newPassword', 'short');
    await page.fill('#confirmPassword', 'short');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=New password must be at least 8 characters long')).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await page.fill('#email', 'invalid-email');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('clears password fields after successful update', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    await page.fill('#currentPassword', testUser.password);
    await page.fill('#newPassword', 'NewValidPassword123!');
    await page.fill('#confirmPassword', 'NewValidPassword123!');
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('text=Settings updated successfully')).toBeVisible();

    // Verify password fields are cleared
    await expect(page.locator('#currentPassword')).toHaveValue('');
    await expect(page.locator('#newPassword')).toHaveValue('');
    await expect(page.locator('#confirmPassword')).toHaveValue('');
  });

  test('preserves form data on validation errors', async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    const newName = 'Test Name Preservation';
    await page.fill('#name', newName);
    await page.fill('#email', 'invalid-email');
    await page.click('button[type="submit"]');

    // Verify error message and preserved form data
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    await expect(page.locator('#name')).toHaveValue(newName);
  });

  test('handles concurrent updates gracefully', async ({ page, browser }) => {
    // Login in first context
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Create second context
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    // Login in second context
    await page2.goto('/auth/signin');
    await page2.fill('#email', testUser.email);
    await page2.fill('#password', testUser.password);
    await page2.click('button[type="submit"]');

    // Update name in first context
    await page.goto('/settings');
    await page.fill('#name', 'New Name 1');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Settings updated successfully')).toBeVisible();

    // Update name in second context
    await page2.goto('/settings');
    await page2.fill('#name', 'New Name 2');
    await page2.click('button[type="submit"]');
    await expect(page2.locator('text=Settings updated successfully')).toBeVisible();

    // Verify final state
    await page.reload();
    await expect(page.locator('#name')).toHaveValue('New Name 2');

    await context2.close();
  });

  test('handles network errors gracefully', async ({ page, context }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Go to settings
    await page.goto('/settings');
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Try to update settings
    await page.fill('#name', 'New Name');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=An error occurred')).toBeVisible();

    // Restore online mode
    await context.setOffline(false);
  });
}); 
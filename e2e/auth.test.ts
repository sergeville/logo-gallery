import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

test.describe('Authentication', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!',
    username: `testuser_${Date.now()}`
  };

  test.beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        username: testUser.username
      }
    });
  });

  test.afterAll(async () => {
    // Clean up test user
    await prisma.user.delete({
      where: { email: testUser.email }
    });
  });

  test('shows sign in form', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await expect(page.locator('h2')).toContainText('Sign in to your account');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('handles invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.text-red-700')).toContainText('Invalid credentials');
  });

  test('handles missing credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    await expect(page.locator('#email:invalid')).toBeVisible();
    await expect(page.locator('#password:invalid')).toBeVisible();
  });

  test('successful login redirects to home', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to home
    await expect(page).toHaveURL('/');
    
    // Should show user menu
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible();
  });

  test('maintains session after reload', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Verify logged in
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible();

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible();
  });

  test('handles server errors gracefully', async ({ page }) => {
    await page.route('**/api/auth/callback/credentials', route => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      });
    });

    await page.goto('/auth/signin');
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    await expect(page.locator('.text-red-700')).toContainText('An error occurred');
  });

  test('shows loading state during authentication', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    
    // Click submit and immediately check for loading state
    await Promise.all([
      page.click('button[type="submit"]'),
      expect(page.locator('button[type="submit"]')).toContainText('Signing in...')
    ]);
  });
}); 
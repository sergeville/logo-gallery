import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const screenshotsDir = path.join(process.cwd(), 'e2e', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('Authentication UI Tests', () => {
  test('should render sign-in page correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Verify initial render
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'create a new account' })).toBeVisible();
    await expect(page.getByPlaceholder('Email address')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();

    // Take screenshot for visual comparison
    await page.screenshot({
      path: path.join(screenshotsDir, 'auth-signin-initial.png')
    });
  });

  test('should show loading states correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Click sign in without filling form to trigger loading state
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    
    // Verify loading spinner appears
    await expect(page.getByRole('status')).toBeVisible();
    
    // Take screenshot of loading state
    await page.screenshot({
      path: path.join(screenshotsDir, 'auth-signin-loading.png')
    });
  });

  test('should show error states correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Fill invalid credentials
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Wait for error message to appear and be visible
    await page.waitForSelector('.text-red-700', { state: 'visible' });

    // Take screenshot of error state
    await page.screenshot({
      path: path.join(screenshotsDir, 'auth-signin-error.png')
    });

    // Verify any error message is visible (since the exact message might vary)
    const errorElement = await page.$('.text-red-700');
    expect(errorElement).not.toBeNull();
  });

  test('should handle social login buttons correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Verify social login buttons are visible
    await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with GitHub', exact: true })).toBeVisible();

    // Click Google login and verify loading state
    await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
    await expect(page.getByRole('status')).toBeVisible();

    // Take screenshot of social login state
    await page.screenshot({
      path: path.join(screenshotsDir, 'auth-signin-social.png')
    });
  });

  test('should handle dark mode correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    // Wait for dark mode styles to apply
    await page.waitForTimeout(500);

    // Take screenshot in dark mode
    await page.screenshot({
      path: path.join(screenshotsDir, 'auth-signin-dark.png')
    });
  });
}); 
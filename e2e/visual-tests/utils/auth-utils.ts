import { Page } from '@playwright/test';

export async function signIn(page: Page) {
  // Get test credentials from environment variables
  const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
  const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error('Test credentials not found in environment variables');
  }

  // Navigate to sign in page
  await page.goto('/api/auth/signin');

  // Fill in credentials and submit
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('**/gallery');
}

export async function login(page: Page): Promise<void> {
  // Get test credentials from environment variables
  const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
  const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error('Test credentials not found in environment variables');
  }

  // Navigate to sign in page
  await page.goto('/api/auth/signin');

  // Fill in credentials and submit
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL('**/gallery');
}

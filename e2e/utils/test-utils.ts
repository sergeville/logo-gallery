import { Page, expect } from '@playwright/test';

/**
 * Helper function to register a new user
 */
export async function registerNewUser(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  
  // Click "Create an account" link
  await page.getByText('Create an account').click();
  
  // Fill in registration form
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign up' }).click();
  
  // Wait for registration to complete and redirect
  await expect(page).toHaveURL('/');
}

/**
 * Helper function to login an existing user
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  
  // Fill in login form
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for login to complete and redirect
  await expect(page).toHaveURL('/');
}

/**
 * Helper function to upload a logo
 */
export async function uploadLogo(page: Page, filePath: string, title: string) {
  await page.goto('/my-logos');
  // Wait for the page to be ready
  await page.waitForLoadState('networkidle');
  
  // Click upload button
  await page.getByRole('button', { name: 'Upload Logo' }).click();
  
  // Fill in upload form
  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByLabel('Title').fill(title);
  await page.getByRole('button', { name: 'Upload' }).click();
  
  // Wait for upload to complete
  await expect(page.getByText('Logo uploaded successfully')).toBeVisible();
}

/**
 * Helper function to clean up test data
 */
export async function cleanupTestUser(page: Page) {
  try {
    await page.goto('/settings');
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle');
    
    // Click delete account button if visible
    const deleteButton = page.getByRole('button', { name: 'Delete Account' });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      // Wait for deletion to complete and redirect
      await expect(page).toHaveURL('/auth/signin');
    }
  } catch (error) {
    console.log('Cleanup failed, but continuing:', error.message);
  }
} 
import { test as base } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants';

// Declare the types of your fixtures
type AuthFixtures = {
  authenticatedPage: typeof base.page;
};

// Extend the base test with authentication
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Go to the login page
    await page.goto(`${LOCALHOST_URL}/auth/signin`);

    // Wait for the form to be ready
    await page.waitForSelector('form', { state: 'visible' });

    // Fill in login credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit the form
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);

    // Wait for navigation to complete and check for successful login
    await Promise.all([
      page.waitForURL('**/*'),
      page.waitForLoadState('networkidle')
    ]);

    // Use the authenticated page
    await use(page);
  },
});

export { expect } from '@playwright/test'; 
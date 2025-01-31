import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants'

test.describe('Vote Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Mock logo data
    await page.route('**/api/logos?votePage=true', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          logos: [
            {
              _id: '1',
              name: 'Test Logo 1',
              imageUrl: '/placeholder/200/200',
              thumbnailUrl: '/placeholder/200/200',
              description: 'Test Description 1',
              userId: 'user1',
              ownerName: 'User 1',
              width: 200,
              height: 200
            },
            {
              _id: '2',
              name: 'Test Logo 2',
              imageUrl: '/placeholder/200/200',
              thumbnailUrl: '/placeholder/200/200',
              description: 'Test Description 2',
              userId: 'user2',
              ownerName: 'User 2',
              width: 200,
              height: 200
            },
          ],
        }),
      });
    });
  });

  test('vote page should match snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for content to be visible
    await page.waitForSelector('[data-testid="main-content"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('vote-page.png');
  });

  test('vote page with selected logo', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for content to be visible
    await page.waitForSelector('[data-testid="main-content"]', { state: 'visible', timeout: 30000 });
    
    // Select a logo
    await page.getByRole('radio').first().click();
    
    // Take a screenshot after selection
    await expect(page).toHaveScreenshot('vote-page-with-selection.png');
  });

  test('vote page error state', async ({ page }) => {
    // Mock error response
    await page.route('**/api/logos?votePage=true', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to load logos' }),
      });
    });

    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot of error state
    await expect(page).toHaveScreenshot('vote-page-error.png');
  });

  test('vote page layout matches snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for content to be visible
    await page.waitForSelector('[data-testid="main-content"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('vote-page-layout.png');
  });

  test('vote interaction matches snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for content to be visible
    await page.waitForSelector('[data-testid="main-content"]', { state: 'visible', timeout: 30000 });
    
    // Select a logo
    await page.getByRole('radio').first().click();
    
    // Take a screenshot after selection
    await expect(page).toHaveScreenshot('vote-page-interaction.png');
  });

  test('vote results match snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for content to be visible
    await page.waitForSelector('[data-testid="main-content"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('vote-page-results.png');
  });
}); 
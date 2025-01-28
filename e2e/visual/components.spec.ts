import { test, expect } from '@playwright/test';
import { LOCALHOST_URL } from '@/config/constants'

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: 'user1',
            name: 'Test User',
            email: 'test@example.com',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Mock logo data for voting
    await page.route('**/api/logos?votePage=true', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          logos: [
            {
              _id: '1',
              name: 'Test Logo 1',
              imageUrl: 'https://placehold.co/200x200/png',
              thumbnailUrl: 'https://placehold.co/200x200/png',
              description: 'Test Description 1',
              userId: 'user2', // Different user to allow voting
              ownerName: 'Other User',
              createdAt: new Date().toISOString()
            }
          ]
        }),
      });
    });

    // Mock logo data for gallery
    await page.route('**/api/logos**', async (route) => {
      if (route.request().url().includes('votePage=true')) {
        return;
      }
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          logos: [
            {
              _id: '1',
              name: 'Test Logo 1',
              imageUrl: 'https://placehold.co/200x200/png',
              description: 'Test Description 1',
              userId: 'user1',
              createdAt: new Date().toISOString(),
              tags: ['test', 'logo'],
              totalVotes: 10
            }
          ],
          pagination: {
            current: 1,
            total: 1,
            hasMore: false
          }
        }),
      });
    });

    // Wait for page to load
    await page.goto(`${LOCALHOST_URL}/gallery`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
      page.waitForSelector('.grid', { state: 'visible', timeout: 30000 })
    ]);
  });

  test('LogoImage component states', async ({ page }) => {
    // Wait for logo images to load
    await page.waitForSelector('[data-testid="logo-image"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot of the logo image
    const logoImage = await page.locator('[data-testid="logo-image"]').first();
    await expect(logoImage).toHaveScreenshot('logo-image.png');
  });

  test('LogoCard component variations', async ({ page }) => {
    // Wait for logo cards to load
    await page.waitForSelector('[data-testid="logo-card"]', { state: 'visible', timeout: 30000 });
    
    // Take a screenshot of a logo card
    const logoCard = await page.locator('[data-testid="logo-card"]').first();
    await expect(logoCard).toHaveScreenshot('logo-card.png');
  });

  test('Vote button states', async ({ page }) => {
    // Navigate to vote page and wait for it to load
    await page.goto(`${LOCALHOST_URL}/vote`);
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Wait for radio button and select it
    await page.waitForSelector('input[type="radio"]', { state: 'visible', timeout: 30000 });
    await page.click('input[type="radio"]');
    
    // Wait for submit button and take screenshots
    const submitButton = page.locator('button:has-text("Submit Vote")');
    await submitButton.waitFor({ state: 'visible', timeout: 30000 });
    
    // Default state
    await expect(submitButton).toHaveScreenshot('vote-button-default.png');
    
    // Hover state
    await submitButton.hover();
    await page.waitForTimeout(500); // Wait for hover effect
    await expect(submitButton).toHaveScreenshot('vote-button-hover.png');
  });

  test('Dark mode components', async ({ page }) => {
    // Wait for theme toggle to be visible
    await page.waitForSelector('[data-testid="theme-toggle"]', { state: 'visible', timeout: 30000 });
    const themeToggle = page.getByTestId('theme-toggle');
    
    // Take screenshot before dark mode
    await expect(page).toHaveScreenshot('light-mode-components.png');
    
    // Enable dark mode
    await themeToggle.click();
    await page.waitForTimeout(1000); // Wait for theme transition
    
    // Take screenshot after dark mode
    await expect(page).toHaveScreenshot('dark-mode-components.png');
  });

  test('Responsive layouts', async ({ page }) => {
    // Wait for initial content to load
    await page.waitForSelector('.grid', { state: 'visible', timeout: 30000 });
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for responsive adjustments
    await expect(page).toHaveScreenshot('mobile-layout.png');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000); // Wait for responsive adjustments
    await expect(page).toHaveScreenshot('desktop-layout.png');
  });

  test('gallery components match snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/gallery`);
    // ... rest of the test
  });

  test('vote components match snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/vote`);
    // ... rest of the test
  });
}); 
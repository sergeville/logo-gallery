import { test, expect } from '@playwright/test'
import {
  VIEWPORT_SIZES,
  preparePageForVisualTest,
  testResponsiveLayouts,
  testComponentStates,
  compareScreenshots,
  VisualTestOptions
} from '../visual-tests/utils/visual-test-utils'
import { LOCALHOST_URL } from '@/config/constants'

test.describe('Visual Regression Tests', () => {
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
      })
    })

    // Mock logo data
    await page.route('**/api/logos', async (route) => {
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
      })
    })

    await page.goto(LOCALHOST_URL, { waitUntil: 'domcontentloaded' })
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ])
  })

  test('homepage layout matches snapshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="main-content"]', { state: 'visible', timeout: 30000 })
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('logo card layout matches snapshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="logo-card"]', { state: 'visible', timeout: 30000 })
    const logoCard = await page.locator('[data-testid="logo-card"]').first()
    await expect(logoCard).toHaveScreenshot('logo-card-layout.png')
  })

  test('auth modal layout matches snapshot', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForSelector('form', { state: 'visible', timeout: 30000 })
    await expect(page.locator('form')).toHaveScreenshot('auth-modal.png')
  })

  test('dark mode layout matches snapshot', async ({ page }) => {
    await page.locator('[data-testid="theme-toggle"]').click()
    await page.waitForTimeout(1000)
    await expect(page).toHaveScreenshot('dark-mode-layout.png')
  })

  test('error states match snapshots', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/nonexistent-page`)
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ])
    await expect(page).toHaveScreenshot('404-page.png')
  })

  test('upload form layout matches snapshot', async ({ page }) => {
    await page.goto(`${LOCALHOST_URL}/upload`)
    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ])
    await page.waitForSelector('form', { state: 'visible', timeout: 30000 })
    await expect(page.locator('form')).toHaveScreenshot('upload-form.png')
  })
})

test.describe('Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('grid layout should be responsive', async ({ page }) => {
    const options: VisualTestOptions = {
      waitForSelectors: ['.grid-container'],
      customStyles: `
        .grid-container {
          min-height: 500px;
        }
      `,
      async setup() {
        await page.evaluate(() => {
          const container = document.querySelector('.grid-container');
          if (container) {
            container.scrollTop = 0;
          }
        });
      }
    };

    await testResponsiveLayouts(page, 'grid-layout', options);
  });

  test('header layout should be responsive', async ({ page }) => {
    const options: VisualTestOptions = {
      waitForSelectors: ['header'],
      customStyles: `
        header {
          position: relative !important;
        }
      `
    };

    await testResponsiveLayouts(page, 'header-layout', options);
  });

  test('footer layout should be responsive', async ({ page }) => {
    const options: VisualTestOptions = {
      waitForSelectors: ['footer'],
      customStyles: `
        footer {
          position: relative !important;
        }
      `
    };

    await testResponsiveLayouts(page, 'footer-layout', options);
  });
}); 
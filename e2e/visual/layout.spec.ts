import { test, expect } from '../utils/fixtures'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    try {
      await page.waitForSelector('[data-testid="gallery-container"]', { timeout: 5000 })
    } catch (error) {
      console.warn('Gallery container not found immediately, retrying...')
      await page.reload()
      await page.waitForSelector('[data-testid="gallery-container"]', { timeout: 5000 })
    }
  })

  test('homepage layout matches snapshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="gallery-container"]', { state: 'visible', timeout: 10000 })
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('logo card layout matches snapshot', async ({ page, testLogo }) => {
    await page.waitForSelector('[data-testid="logo-card"]', { state: 'visible', timeout: 10000 })
    const logoCard = page.locator('[data-testid="logo-card"]').first()
    await expect(logoCard).toHaveScreenshot('logo-card.png')
  })

  test('auth modal layout matches snapshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="login-button"]', { state: 'visible', timeout: 10000 })
    await page.click('[data-testid="login-button"]')
    await page.waitForSelector('[data-testid="auth-modal"]', { state: 'visible', timeout: 10000 })
    const authModal = page.locator('[data-testid="modal-content"]')
    await expect(authModal).toHaveScreenshot('auth-modal.png')
  })

  test('dark mode layout matches snapshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="theme-toggle"]', { state: 'visible', timeout: 10000 })
    await page.click('[data-testid="theme-toggle"]')
    await page.waitForTimeout(500) // Wait for dark mode transition
    await expect(page).toHaveScreenshot('dark-mode.png')
  })

  test('error states match snapshots', async ({ page }) => {
    // Mock failed request
    await page.route('**/api/logos', route => route.fulfill({
      status: 500,
      body: 'Internal Server Error'
    }))
    
    await page.goto('/')
    await page.waitForSelector('[data-testid="error-message"]', { state: 'visible', timeout: 10000 })
    await expect(page).toHaveScreenshot('error-state.png')
  })

  test('upload form layout matches snapshot', async ({ page, testUser, testData }) => {
    await testData.loginUser(testUser)
    await page.waitForSelector('[data-testid="upload-button"]', { state: 'visible', timeout: 10000 })
    await page.click('[data-testid="upload-button"]')
    await page.waitForSelector('[data-testid="upload-form"]', { state: 'visible', timeout: 10000 })
    const uploadForm = page.locator('[data-testid="upload-form"]')
    await expect(uploadForm).toHaveScreenshot('upload-form.png')
  })
}) 
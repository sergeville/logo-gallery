import { test, expect } from './utils/fixtures'

test.describe('Authentication Flow', () => {
  test('shows login modal when clicking vote without authentication', async ({ page, testLogo }) => {
    await page.goto('/')
    
    // Find and click the first star rating button
    const logoCard = await page.locator(`[data-testid="logo-card"]:has-text("${testLogo.name}")`)
    await expect(logoCard).toBeVisible()
    const ratingButton = await logoCard.locator('[aria-label="Rate 1 stars"]')
    await ratingButton.click()

    // Verify login modal appears
    const modal = await page.locator('[data-testid="auth-modal"]')
    await expect(modal).toBeVisible()
    await expect(page.locator('[data-testid="auth-modal-title"]')).toContainText('Login')
  })

  test('allows user registration', async ({ page, testData }) => {
    const user = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!'
    }

    await testData.createTestUser(user)

    // Verify successful registration
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

    // Clean up
    await testData.cleanupTestUser(user)
  })

  test('allows user login', async ({ page, testUser, testData }) => {
    await testData.loginUser(testUser)

    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('maintains user session after page reload', async ({ page, testUser, testData }) => {
    // Login first
    await testData.loginUser(testUser)

    // Verify login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

    // Reload page
    await page.reload()

    // Verify still logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('allows user logout', async ({ page, testUser, testData }) => {
    // Login first
    await testData.loginUser(testUser)

    // Click logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Verify logged out
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('shows validation errors for invalid input', async ({ page }) => {
    await page.goto('/')
    
    // Open login modal
    await page.click('[data-testid="login-button"]')

    // Submit empty form
    await page.click('[data-testid="login-submit"]')

    // Verify validation errors
    await expect(page.locator('[data-testid="username-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/')
    
    // Open login modal
    await page.click('[data-testid="login-button"]')

    // Fill with invalid credentials
    await page.fill('[data-testid="username-input"]', 'wronguser')
    await page.fill('[data-testid="password-input"]', 'wrongpass')
    await page.click('[data-testid="login-submit"]')

    // Verify error message
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Invalid credentials')
  })
}) 
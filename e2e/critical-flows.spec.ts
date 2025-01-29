import { test, expect } from '@/e2e/utils/fixtures'

test.describe('Critical User Flows', () => {
  test('complete user journey from registration to logo upload', async ({ page, testData }) => {
    // 1. Register new user
    const user = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!'
    }
    await page.goto('/')
    await page.click('[data-testid="login-button"]')
    await page.click('[data-testid="register-tab"]')
    
    // Fill registration form
    await page.fill('[data-testid="username-input"]', user.username)
    await page.fill('[data-testid="email-input"]', user.email)
    await page.fill('[data-testid="password-input"]', user.password)
    await page.click('[data-testid="register-submit"]')
    
    // 2. Verify successful registration
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    
    // 3. Upload a logo
    await page.click('[data-testid="upload-button"]')
    await page.setInputFiles('[data-testid="file-input"]', 'e2e/fixtures/test-logo.png')
    await page.fill('[data-testid="logo-name-input"]', 'Test Logo')
    await page.fill('[data-testid="logo-description-input"]', 'A test logo description')
    await page.fill('[data-testid="logo-tags-input"]', 'test, e2e')
    await page.click('[data-testid="upload-submit"]')
    
    // 4. Verify logo appears in gallery
    await expect(page.locator('[data-testid="logo-card"]:has-text("Test Logo")')).toBeVisible()
    
    // Clean up
    await testData.cleanupTestUser(user)
  })

  test('search and filter functionality', async ({ page, testLogo }) => {
    await page.goto('/')
    
    // Search for logo
    await page.fill('[data-testid="search-input"]', testLogo.name)
    await page.keyboard.press('Enter')
    
    // Verify search results
    await expect(page.locator(`[data-testid="logo-card"]:has-text("${testLogo.name}")`)).toBeVisible()
    
    // Filter by tag
    await page.click('[data-testid="filter-button"]')
    await page.click(`[data-testid="tag-filter"]:has-text("${testLogo.tags[0]}")`)
    
    // Verify filtered results
    await expect(page.locator(`[data-testid="logo-card"]:has-text("${testLogo.name}")`)).toBeVisible()
  })

  test('profile management flow', async ({ page, testUser, testData }) => {
    // Login
    await testData.loginUser(testUser)
    
    // Navigate to profile
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="profile-link"]')
    
    // Update profile
    const newUsername = `updated_${testUser.username}`
    await page.fill('[data-testid="profile-username-input"]', newUsername)
    await page.click('[data-testid="save-profile"]')
    
    // Verify changes
    await expect(page.locator('[data-testid="user-menu"]')).toContainText(newUsername)
    
    // Revert changes
    await page.fill('[data-testid="profile-username-input"]', testUser.username)
    await page.click('[data-testid="save-profile"]')
  })
}) 
import { test, expect } from '@/e2e/utils/fixtures'

test.describe('Authentication Flow', () => {
  test('shows login modal when clicking protected action without authentication', async ({ page, testLogo }) => {
    await page.goto('/')
    
    // Find and click the add to collection button
    const logoCard = await page.locator(`.bg-[#0A1A2F]:has-text("${testLogo.name}")`)
    await expect(logoCard).toBeVisible()
    const actionButton = await logoCard.locator('button[aria-label="Add to collection"]')
    await actionButton.click()

    // Verify login modal appears
    await expect(page.locator('dialog[role="dialog"]')).toBeVisible()
    await expect(page.locator('h2')).toContainText('Sign in to your account')
  })

  test('allows user registration', async ({ page, testData }) => {
    const user = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!'
    }

    await testData.createTestUser(user)

    // Verify successful registration by checking for upload button visibility
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible()

    // Clean up
    await testData.cleanupTestUser(user)
  })

  test('allows user login', async ({ page, testUser, testData }) => {
    await testData.loginUser(testUser)

    // Verify successful login by checking for upload button visibility
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible()
  })

  test('maintains user session after page reload', async ({ page, testUser, testData }) => {
    // Login first
    await testData.loginUser(testUser)

    // Verify login
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible()

    // Reload page
    await page.reload()

    // Verify still logged in
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible()
  })

  test('allows user logout', async ({ page, testUser, testData }) => {
    // Login first
    await testData.loginUser(testUser)

    // Click logout
    await page.click('button:has-text("Sign Out")')

    // Verify logged out by checking for sign in link
    await expect(page.locator('a[href="/auth/signin"]')).toBeVisible()
  })

  test('shows validation errors for invalid input', async ({ page }) => {
    await page.goto('/')
    
    // Open login modal
    await page.click('a[href="/auth/signin"]')

    // Submit empty form
    await page.click('button:has-text("Sign in")')

    // Verify validation errors
    await expect(page.locator('#email:invalid')).toBeVisible()
    await expect(page.locator('#password:invalid')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/')
    
    // Open login modal
    await page.click('a[href="/auth/signin"]')

    // Fill with invalid credentials
    await page.fill('#email', 'wronguser@example.com')
    await page.fill('#password', 'wrongpass')
    await page.click('button:has-text("Sign in")')

    // Verify error message
    await expect(page.locator('.text-red-700')).toBeVisible()
    await expect(page.locator('.text-red-700')).toContainText('Invalid credentials')
  })

  test('sign out flow works correctly', async ({ page, testUser, testData }) => {
    // Login first using test utilities
    await testData.loginUser(testUser);

    // Verify user is signed in
    await expect(page.locator('a:has-text("Upload Logo")')).toBeVisible();
    
    // Click sign out button
    await page.click('button:has-text("Sign Out")');
    
    // Verify redirect to home page
    await page.waitForURL('/');
    
    // Verify user is signed out
    await expect(page.locator('a[href="/auth/signin"]')).toBeVisible();
    await expect(page.locator('a:has-text("Upload Logo")')).not.toBeVisible();
    
    // Verify session is cleared by trying to access protected route
    await page.goto('/my-logos');
    await page.waitForURL('/auth/signin');
  })
}) 
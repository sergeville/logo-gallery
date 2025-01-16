import { test as base } from '@playwright/test'
import { TestData, TestUser, TestLogo } from './test-data'

// Extend the base test type with our fixtures
type Fixtures = {
  testData: TestData
  testUser: TestUser
  testLogo: TestLogo
}

// Define the test with fixtures
export const test = base.extend<Fixtures>({
  testData: async ({ page }, use) => {
    // Initialize test data with page
    const testData = new TestData(page)
    await use(testData)
  },

  testUser: async ({ page, testData }, use) => {
    let user: TestUser | undefined

    try {
      // Ensure page is loaded before creating user
      await page.goto('http://localhost:3001/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Create a test user
      user = await testData.createTestUser()
      
      // Use the test user
      await use(user)
    } catch (error) {
      console.error('Failed to create test user:', error)
      // Take a screenshot on failure
      await page.screenshot({ path: 'test-failure.png' })
      throw error
    } finally {
      // Clean up after test
      if (user) {
        try {
          await testData.cleanupTestUser(user)
        } catch (error) {
          console.warn('Failed to cleanup test user:', error)
        }
      }
    }
  },

  testLogo: async ({ page, testData, testUser }, use) => {
    let logo: TestLogo | undefined

    try {
      // Ensure page is loaded before creating logo
      await page.goto('http://localhost:3001/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      // Login and create a test logo
      await testData.loginUser(testUser)
      logo = await testData.uploadTestLogo()
      
      // Use the test logo
      await use(logo)
    } catch (error) {
      console.error('Failed to create test logo:', error)
      // Take a screenshot on failure
      await page.screenshot({ path: 'test-failure-logo.png' })
      throw error
    } finally {
      // Clean up after test
      if (logo) {
        try {
          await testData.deleteTestLogo(logo.name)
        } catch (error) {
          console.warn('Failed to cleanup test logo:', error)
        }
      }
    }
  },
})

export { expect } from '@playwright/test' 
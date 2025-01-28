import path from 'path'
import { test, expect } from './utils/fixtures'

test.describe('Logo Management', () => {
  test('allows uploading a new logo', async ({ page, testUser, testData }) => {
    // Login first
    await testData.loginUser(testUser)

    // Upload logo
    const logo = await testData.uploadTestLogo({
      name: 'Test Logo',
      description: 'A test logo description',
      tags: ['test', 'logo']
    })

    // Verify logo appears in gallery
    await expect(page.locator(`text=${logo.name}`)).toBeVisible()
    await expect(page.locator(`text=${logo.description}`)).toBeVisible()
  })

  test('allows filtering logos by tag', async ({ page, testLogo }) => {
    // Click tag filter
    await page.click('[data-testid="tag-filter"]')
    await page.click(`text=${testLogo.tags[0]}`)

    // Verify filtered results
    const logoCards = await page.locator('[data-testid="logo-card"]').all()
    for (const card of logoCards) {
      await expect(card.locator('[data-testid="logo-tags"]')).toContainText(testLogo.tags[0])
    }
  })

  test('allows searching logos', async ({ page, testLogo }) => {
    // Enter search term
    await page.fill('[data-testid="search-input"]', testLogo.name)

    // Verify search results
    await expect(page.locator(`text=${testLogo.name}`)).toBeVisible()
    await expect(page.locator('[data-testid="logo-card"]')).toHaveCount(1)
  })

  test('allows deleting own logo', async ({ page, testUser, testData }) => {
    // Login and create a logo to delete
    await testData.loginUser(testUser)
    const logo = await testData.uploadTestLogo()
    
    // Delete the logo
    await testData.deleteTestLogo(logo.name)

    // Verify logo is removed
    await expect(page.locator(`text=${logo.name}`)).not.toBeVisible()
  })

  test('shows error for invalid file upload', async ({ page, testUser, testData }) => {
    // Login first
    await testData.loginUser(testUser)

    // Click upload button
    await page.click('[data-testid="upload-button"]')

    // Try to upload invalid file
    const invalidFilePath = path.join(__dirname, '../public/test.txt')
    await page.setInputFiles('[data-testid="logo-file-input"]', invalidFilePath)

    // Verify error message
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="file-error"]')).toContainText('Invalid file type')
  })

  test('handles pagination correctly', async ({ page, testUser, testData }) => {
    // Login and create multiple logos
    await testData.loginUser(testUser)
    for (let i = 0; i < 12; i++) {
      await testData.uploadTestLogo({ name: `Test Logo ${i}` })
    }

    // Get initial logos
    const initialLogos = await page.locator('[data-testid="logo-card"]').all()
    const initialCount = initialLogos.length

    // Go to next page
    await page.click('[data-testid="next-page"]')

    // Verify different logos are shown
    const nextPageLogos = await page.locator('[data-testid="logo-card"]').all()
    expect(nextPageLogos.length).toBeGreaterThan(0)
    expect(nextPageLogos.length).toBeLessThanOrEqual(initialCount)

    // Verify page indicator
    await expect(page.locator('[data-testid="page-indicator"]')).toContainText('Page 2')
  })

  test('maintains filter state across pagination', async ({ page, testUser, testData }) => {
    // Login and create multiple logos with specific tag
    await testData.loginUser(testUser)
    for (let i = 0; i < 12; i++) {
      await testData.uploadTestLogo({
        name: `Test Logo ${i}`,
        tags: ['pagination-test']
      })
    }

    // Apply filter
    await page.click('[data-testid="tag-filter"]')
    await page.click('text=pagination-test')

    // Go to next page
    await page.click('[data-testid="next-page"]')

    // Verify filter is still applied
    const logoCards = await page.locator('[data-testid="logo-card"]').all()
    for (const card of logoCards) {
      await expect(card.locator('[data-testid="logo-tags"]')).toContainText('pagination-test')
    }
  })
}) 
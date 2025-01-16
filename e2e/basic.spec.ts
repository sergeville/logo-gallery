import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:3001')
  
  // Wait for the page to be loaded
  await page.waitForLoadState('networkidle')
  
  // Take a screenshot
  await page.screenshot({ path: 'homepage.png' })
  
  // Check if the page title is visible
  const title = await page.locator('h1').first()
  await expect(title).toBeVisible()
  await expect(title).toContainText('Logo Gallery')
}) 
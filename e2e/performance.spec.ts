import { test, expect } from './utils/fixtures'

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    // Start measuring
    const startTime = Date.now()
    
    // Load the page
    const response = await page.goto('/')
    
    // Verify successful load
    expect(response?.status()).toBe(200)
    
    // Wait for gallery to be visible
    await page.waitForSelector('[data-testid="gallery-container"]')
    
    // Calculate load time
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load in under 3 seconds
    
    // Check First Contentful Paint
    const fcpEntry = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            resolve(entries[0].startTime)
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    expect(Number(fcpEntry)).toBeLessThan(1500) // FCP should be under 1.5 seconds
  })

  test('infinite scroll performance', async ({ page }) => {
    await page.goto('/')
    
    // Initial load time measurement
    const startTime = Date.now()
    await page.waitForSelector('[data-testid="logo-card"]')
    const initialLoadTime = Date.now() - startTime
    
    // Scroll to bottom multiple times
    for (let i = 0; i < 3; i++) {
      const scrollStartTime = Date.now()
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForResponse(response => response.url().includes('/api/logos'))
      const scrollLoadTime = Date.now() - scrollStartTime
      expect(scrollLoadTime).toBeLessThan(1000) // Each scroll load should be under 1 second
    }
  })

  test('image optimization', async ({ page }) => {
    await page.goto('/')
    
    // Get all logo images
    const images = await page.$$eval('img[data-testid="logo-image"]', (imgs: HTMLImageElement[]) => 
      imgs.map(img => ({
        src: img.src,
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }))
    )
    
    // Verify images are properly sized
    for (const img of images) {
      // Check if image is not oversized for display
      expect(img.naturalWidth).toBeLessThanOrEqual(img.width * 2) // Account for retina displays
      expect(img.naturalHeight).toBeLessThanOrEqual(img.height * 2)
    }
  })

  test('search performance', async ({ page }) => {
    await page.goto('/')
    
    // Measure search response time
    const searchTerm = 'test'
    const startTime = Date.now()
    
    await page.fill('[data-testid="search-input"]', searchTerm)
    await page.keyboard.press('Enter')
    
    // Wait for search results
    await page.waitForResponse(response => 
      response.url().includes('/api/logos') && 
      response.url().includes(searchTerm)
    )
    
    const searchTime = Date.now() - startTime
    expect(searchTime).toBeLessThan(500) // Search should complete in under 500ms
  })

  test('rate limiting', async ({ page, testUser, testData }) => {
    await testData.loginUser(testUser)
    
    // Attempt rapid-fire API calls
    const startTime = Date.now()
    const requests = []
    
    // Make 10 rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(
        page.evaluate(() =>
          fetch('/api/logos', { method: 'GET' }).then(r => r.status)
        )
      )
    }
    
    const responses = await Promise.all(requests)
    const requestTime = Date.now() - startTime
    
    // Verify rate limiting is working
    expect(responses.some(status => status === 429)).toBe(true)
    
    // Wait for rate limit to reset
    await page.waitForTimeout(5000)
    
    // Verify normal service resumes
    const response = await page.evaluate(() =>
      fetch('/api/logos', { method: 'GET' }).then(r => r.status)
    )
    expect(response).toBe(200)
  })
}) 
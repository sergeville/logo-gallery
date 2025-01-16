import { Page } from '@playwright/test'
import path from 'path'

export interface TestUser {
  username: string
  email: string
  password: string
}

export interface TestLogo {
  name: string
  description: string
  tags: string[]
  imagePath: string
}

export class TestData {
  constructor(private page: Page) {}

  private async waitForElement(selector: string, options = { timeout: 15000 }) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await this.page.waitForLoadState('networkidle')
        const element = await this.page.waitForSelector(selector, { 
          ...options, 
          state: 'visible',
        })
        if (element) return element
      } catch (error) {
        console.warn(`Attempt ${attempt}: Element ${selector} not found, ${attempt < 2 ? 'retrying...' : 'giving up.'}`)
        if (attempt < 2) {
          await this.page.reload()
          await this.page.waitForLoadState('networkidle')
        } else {
          throw error
        }
      }
    }
  }

  async createTestUser(user?: Partial<TestUser>): Promise<TestUser> {
    const testUser: TestUser = {
      username: user?.username || `testuser_${Date.now()}`,
      email: user?.email || `test_${Date.now()}@example.com`,
      password: user?.password || 'Test123!',
    }

    try {
      await this.waitForElement('[data-testid="login-button"]')
      await this.page.click('[data-testid="login-button"]')
      
      await this.waitForElement('[data-testid="register-tab"]')
      await this.page.click('[data-testid="register-tab"]')
      
      await this.waitForElement('[data-testid="username-input"]')
      await this.page.fill('[data-testid="username-input"]', testUser.username)
      await this.page.fill('[data-testid="email-input"]', testUser.email)
      await this.page.fill('[data-testid="password-input"]', testUser.password)
      
      await Promise.all([
        this.page.waitForResponse(response => response.url().includes('/api/auth/register')),
        this.page.click('[data-testid="register-submit"]')
      ])

      return testUser
    } catch (error) {
      console.error('Failed to create test user:', error)
      throw error
    }
  }

  async loginUser(user: TestUser) {
    try {
      await this.waitForElement('[data-testid="login-button"]')
      await this.page.click('[data-testid="login-button"]')
      
      await this.waitForElement('[data-testid="email-input"]')
      await this.page.fill('[data-testid="email-input"]', user.email)
      await this.page.fill('[data-testid="password-input"]', user.password)
      
      await Promise.all([
        this.page.waitForResponse(response => response.url().includes('/api/auth/login')),
        this.page.click('[data-testid="login-submit"]')
      ])
    } catch (error) {
      console.error('Failed to login user:', error)
      throw error
    }
  }

  async cleanupTestUser(user: TestUser) {
    try {
      const response = await this.page.evaluate(async (userData: TestUser) => {
        const res = await fetch('/api/user/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: userData.password }),
        })
        return { ok: res.ok, status: res.status }
      }, user)

      if (!response.ok) {
        console.warn(`Failed to cleanup test user. Status: ${response.status}`)
      }
    } catch (error) {
      console.warn('Error during user cleanup:', error)
    }
  }

  async uploadTestLogo(logo?: Partial<TestLogo>): Promise<TestLogo> {
    const testLogo: TestLogo = {
      name: logo?.name || `Test Logo ${Date.now()}`,
      description: logo?.description || 'A test logo for e2e testing',
      tags: logo?.tags || ['test', 'e2e'],
      imagePath: logo?.imagePath || path.join(__dirname, '..', 'fixtures', 'test-logo.png')
    }

    try {
      await this.waitForElement('[data-testid="upload-button"]')
      await this.page.click('[data-testid="upload-button"]')
      
      await this.waitForElement('[data-testid="file-input"]')
      await this.page.setInputFiles('[data-testid="file-input"]', testLogo.imagePath)
      
      await this.waitForElement('[data-testid="logo-name-input"]')
      await this.page.fill('[data-testid="logo-name-input"]', testLogo.name)
      await this.page.fill('[data-testid="logo-description-input"]', testLogo.description)
      await this.page.fill('[data-testid="logo-tags-input"]', testLogo.tags.join(', '))
      
      await Promise.all([
        this.page.waitForResponse(response => response.url().includes('/api/logos')),
        this.page.click('[data-testid="upload-submit"]')
      ])

      return testLogo
    } catch (error) {
      console.error('Failed to upload test logo:', error)
      throw error
    }
  }

  async deleteTestLogo(logoName: string) {
    try {
      const response = await this.page.evaluate(async (name: string) => {
        const res = await fetch(`/api/logos/${encodeURIComponent(name)}`, {
          method: 'DELETE',
        })
        return { ok: res.ok, status: res.status }
      }, logoName)

      if (!response.ok) {
        console.warn(`Failed to cleanup test logo. Status: ${response.status}`)
      }
    } catch (error) {
      console.warn('Error during logo cleanup:', error)
    }
  }
} 
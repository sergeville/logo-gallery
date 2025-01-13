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

  async createTestUser(user?: Partial<TestUser>): Promise<TestUser> {
    const testUser: TestUser = {
      username: user?.username || `testuser_${Date.now()}`,
      email: user?.email || `test_${Date.now()}@example.com`,
      password: user?.password || 'Test123!',
    }

    await this.page.goto('/')
    await this.page.click('[data-testid="login-button"]')
    await this.page.click('[data-testid="register-tab"]')
    
    await this.page.fill('[data-testid="username-input"]', testUser.username)
    await this.page.fill('[data-testid="email-input"]', testUser.email)
    await this.page.fill('[data-testid="password-input"]', testUser.password)
    await this.page.click('[data-testid="register-submit"]')

    return testUser
  }

  async loginUser(user: TestUser) {
    await this.page.goto('/')
    await this.page.click('[data-testid="login-button"]')
    
    await this.page.fill('[data-testid="username-input"]', user.username)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.click('[data-testid="login-submit"]')
  }

  async cleanupTestUser(user: TestUser) {
    // Delete user through API
    await this.page.evaluate(async (userData) => {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: userData.password }),
      })
      return response.ok
    }, user)
  }

  async uploadTestLogo(): Promise<TestLogo> {
    const testLogo: TestLogo = {
      name: `Test Logo ${Date.now()}`,
      description: 'A test logo for e2e testing',
      tags: ['test', 'e2e'],
      imagePath: path.join(__dirname, 'test-logo.png')
    }

    await this.page.click('[data-testid="upload-button"]')
    await this.page.setInputFiles('[data-testid="file-input"]', testLogo.imagePath)
    await this.page.fill('[data-testid="logo-name-input"]', testLogo.name)
    await this.page.fill('[data-testid="logo-description-input"]', testLogo.description)
    await this.page.fill('[data-testid="logo-tags-input"]', testLogo.tags.join(', '))
    await this.page.click('[data-testid="upload-submit"]')

    return testLogo
  }

  async deleteTestLogo(logoName: string) {
    // Delete logo through API
    await this.page.evaluate(async (name) => {
      const response = await fetch(`/api/logos/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      return response.ok
    }, logoName)
  }
} 
import { TestDbHelper } from '../test-db-helper'

describe('Validation Integration Tests', () => {
  let testDb: TestDbHelper
  let testUsers: any[]
  let testLogos: any[]

  beforeAll(async () => {
    testDb = new TestDbHelper()
    await testDb.connect()
  })

  afterAll(async () => {
    await testDb.disconnect()
  })

  beforeEach(async () => {
    await testDb.clearDatabase()
    
    testUsers = [
      {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }
    ]

    testLogos = [
      {
        name: 'Test Logo',
        imageUrl: 'https://example.com/logo.png',
        dimensions: { width: 100, height: 100 }
      }
    ]
  })

  describe('User Validation', () => {
    it('should validate a valid user', async () => {
      const user = testUsers[0]
      await testDb.insertUser(user)
      const result = await testDb.findUser({ email: user.email })
      expect(result).toBeTruthy()
    })

    it('should detect invalid email format', async () => {
      const user = { ...testUsers[0], email: 'invalid-email' }
      await expect(testDb.insertUser(user)).rejects.toThrow()
    })
  })

  describe('Logo Validation', () => {
    it('should validate a valid logo', async () => {
      const logo = testLogos[0]
      await testDb.insertLogo(logo)
      const result = await testDb.findLogo({ name: logo.name })
      expect(result).toBeTruthy()
    })

    it('should detect invalid URLs', async () => {
      const logo = { ...testLogos[0], imageUrl: 'invalid-url' }
      await expect(testDb.insertLogo(logo)).rejects.toThrow()
    })
  })
}) 
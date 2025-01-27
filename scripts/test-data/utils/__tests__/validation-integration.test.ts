import { TestDbHelper } from '../test-db-helper'
import { validateUser, validateLogo } from '../../../seed/validation'
import type { ClientUser, ClientLogo } from '@/lib/types'

describe('Validation Integration Tests', () => {
  let testDb: TestDbHelper

  beforeEach(async () => {
    testDb = new TestDbHelper()
    await testDb.connect()
  })

  afterEach(async () => {
    await testDb.clearAllCollections()
    await testDb.disconnect()
  })

  describe('User Validation', () => {
    it('validates and fixes user data', async () => {
      const testUser: Partial<ClientUser> = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const validationResult = await validateUser(testUser)
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.errors).toHaveLength(0)

      if (validationResult.isValid && validationResult.data) {
        await testDb.insertUser(validationResult.data)
        const result = await testDb.findUser({ email: testUser.email })
        expect(result).toBeDefined()
        expect(result?.name).toBe(testUser.name)
      }
    })

    it('detects invalid user data', async () => {
      const invalidUser: Partial<ClientUser> = {
        name: '',
        email: 'invalid-email',
        role: 'user',
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      }

      const validationResult = await validateUser(invalidUser)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Logo Validation', () => {
    it('validates and fixes logo data', async () => {
      const testLogo: Partial<ClientLogo> = {
        name: 'Test Logo',
        description: 'A test logo',
        imageUrl: 'https://example.com/logo.png',
        thumbnailUrl: 'https://example.com/logo-thumb.png',
        ownerId: '1',
        ownerName: 'Test User',
        category: 'tech',
        tags: ['test', 'logo'],
        dimensions: { width: 200, height: 200 },
        fileSize: 1024,
        fileType: 'image/png',
        averageRating: 0,
        totalVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const validationResult = await validateLogo(testLogo)
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.errors).toHaveLength(0)

      if (validationResult.isValid && validationResult.data) {
        await testDb.insertLogo(validationResult.data)
        const result = await testDb.findLogo({ name: testLogo.name })
        expect(result).toBeDefined()
        expect(result?.description).toBe(testLogo.description)
      }
    })

    it('detects invalid logo data', async () => {
      const invalidLogo: Partial<ClientLogo> = {
        name: '',
        description: '',
        imageUrl: 'invalid-url',
        thumbnailUrl: 'invalid-url',
        ownerId: '',
        ownerName: '',
        category: '',
        tags: [],
        dimensions: { width: -1, height: -1 },
        fileSize: -1,
        fileType: 'invalid',
        averageRating: -1,
        totalVotes: -1,
        createdAt: 'invalid-date',
        updatedAt: 'invalid-date'
      }

      const validationResult = await validateLogo(invalidLogo)
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.errors.length).toBeGreaterThan(0)
    })
  })
}) 
import { TestDbHelper } from '../test-db-helper'
import { MongoClient } from 'mongodb'

describe('TestDbHelper', () => {
  let testDbHelper: TestDbHelper

  beforeEach(() => {
    testDbHelper = new TestDbHelper()
  })

  afterEach(async () => {
    await testDbHelper.disconnect()
  })

  describe('constructor', () => {
    it('should create an instance with default values', () => {
      expect(testDbHelper).toBeInstanceOf(TestDbHelper)
      expect(testDbHelper.getClient()).toBeDefined()
    })
  })

  describe('connection management', () => {
    it('should start disconnected', () => {
      expect(testDbHelper.isConnected).toBe(false)
    })

    it('should connect to database', async () => {
      await testDbHelper.connect()
      expect(testDbHelper.isConnected).toBe(true)

      const collection = testDbHelper.collection('test')
      expect(collection).toBeDefined()
    })

    it('should disconnect from database', async () => {
      await testDbHelper.connect()
      const collection = testDbHelper.collection('test')
      expect(collection).toBeDefined()

      await testDbHelper.disconnect()
      expect(testDbHelper.isConnected).toBe(false)
    })
  })

  describe('collection operations', () => {
    beforeEach(async () => {
      await testDbHelper.connect()
    })

    it('should clear specified collections', async () => {
      const collections = ['test1', 'test2']
      for (const name of collections) {
        const collection = testDbHelper.collection(name)
        await collection.insertOne({ test: true })
      }

      await testDbHelper.clearCollections(collections)

      for (const name of collections) {
        const collection = testDbHelper.collection(name)
        const count = await collection.countDocuments()
        expect(count).toBe(0)
      }
    })
  })

  describe('error handling', () => {
    it('should throw error when accessing collection without connection', () => {
      expect(() => testDbHelper.collection('test')).toThrow('Database not connected')
    })

    it('should throw error when clearing collection without connection', async () => {
      await expect(testDbHelper.clearCollection('test')).rejects.toThrow('Database not connected')
    })

    it('should throw error when clearing collections with invalid parameter', async () => {
      await expect(testDbHelper.clearCollections(null as any)).rejects.toThrow('Collections parameter must be an array')
    })
  })
}) 
import { MongoClient, Db, Collection, Document } from 'mongodb'
import type { ClientUser, ClientLogo } from '@/lib/types'
import { MockMongoClient } from '@app/mocks/mongodb'

/**
 * Helper class for managing MongoDB test database connections and operations.
 * Provides methods for connecting to MongoDB, managing collections, and performing CRUD operations.
 */
export class TestDbHelper {
  private client: MongoClient | MockMongoClient
  private db: Db | any
  private dbName: string
  private _isConnected: boolean = false

  /**
   * Creates a new TestDbHelper instance.
   */
  constructor(uri: string = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017', dbName: string = 'test') {
    this.dbName = dbName
    if (process.env.NODE_ENV === 'test') {
      this.client = new MockMongoClient()
    } else {
      this.client = new MongoClient(uri)
    }
  }

  /**
   * Establishes a connection to the MongoDB database.
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    try {
      await this.client.connect()
      this.db = this.client.db(this.dbName)
      this._isConnected = true
    } catch (error) {
      console.error('Failed to connect to database:', error)
      throw error
    }
  }

  /**
   * Closes the MongoDB connection if it exists.
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this._isConnected = false
    }
  }

  /**
   * Gets a MongoDB collection with the specified name.
   * @param name - The name of the collection to retrieve
   * @returns Collection instance for the specified name
   * @throws Error if database is not connected
   */
  collection<T extends Document>(name: string): Collection<T> {
    if (!this._isConnected) {
      throw new Error('Database not connected')
    }
    return this.db.collection(name)
  }

  /**
   * Inserts a user document into the users collection.
   * @param userData - The user data to insert
   * @returns Promise resolving to void
   */
  async insertUser(user: Partial<ClientUser>): Promise<void> {
    const collection = this.collection<ClientUser>('users')
    await collection.insertOne(user as any)
  }

  /**
   * Inserts a logo document into the logos collection.
   * @param logoData - The logo data to insert
   * @returns Promise resolving to void
   */
  async insertLogo(logo: Partial<ClientLogo>): Promise<void> {
    const collection = this.collection<ClientLogo>('logos')
    await collection.insertOne(logo as any)
  }

  /**
   * Finds a user document matching the specified query.
   * @param query - The query to find the user
   * @returns Promise resolving to the found user document or null if not found
   */
  async findUser(query: Partial<ClientUser>): Promise<ClientUser | null> {
    const collection = this.collection<ClientUser>('users')
    return collection.findOne(query)
  }

  /**
   * Finds a logo document matching the specified query.
   * @param query - The query to find the logo
   * @returns Promise resolving to the found logo document or null if not found
   */
  async findLogo(query: Partial<ClientLogo>): Promise<ClientLogo | null> {
    const collection = this.collection<ClientLogo>('logos')
    return collection.findOne(query)
  }

  /**
   * Deletes all documents from the specified collection.
   * @param name - The name of the collection to clear
   */
  async clearCollection(name: string): Promise<void> {
    if (!this._isConnected) {
      throw new Error('Database not connected')
    }
    await this.db.collection(name).deleteMany({})
  }

  /**
   * Deletes all documents from all collections in the database.
   */
  async clearAllCollections(): Promise<void> {
    if (!this._isConnected) {
      throw new Error('Database not connected')
    }
    const collections = await this.db.collections()
    await Promise.all(collections.map((collection: Collection) => collection.deleteMany({})))
  }

  /**
   * Deletes all documents from the specified collections.
   * @param collections - The names of the collections to clear
   */
  async clearCollections(collections: string[]): Promise<void> {
    if (!Array.isArray(collections)) {
      throw new Error('Collections parameter must be an array')
    }
    await Promise.all(collections.map(name => this.clearCollection(name)))
  }

  /**
   * Gets the MongoDB client instance.
   * @returns The MongoDB client
   */
  getClient(): MongoClient | MockMongoClient {
    return this.client
  }

  /**
   * Gets the MongoDB database instance.
   * @returns The MongoDB database
   */
  async getDb(): Promise<Db | null> {
    return this.db
  }

  /**
   * Checks if the database is connected.
   * @returns True if connected, false otherwise
   */
  get isConnected(): boolean {
    return this._isConnected
  }
}

// Export a singleton instance
export const testDb = new TestDbHelper()
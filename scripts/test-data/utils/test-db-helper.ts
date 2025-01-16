import { MongoClient, Db, Collection, Document } from 'mongodb'

/**
 * Helper class for managing MongoDB test database connections and operations.
 * Provides methods for connecting to MongoDB, managing collections, and performing CRUD operations.
 */
export class TestDbHelper {
  private client: MongoClient | null = null
  private db: Db | null = null
  private uri: string

  /**
   * Creates a new TestDbHelper instance.
   * @param uri - Optional MongoDB connection URI. Defaults to MONGODB_URI environment variable or localhost.
   */
  constructor(uri?: string) {
    this.uri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/test_db'
  }

  /**
   * Establishes a connection to the MongoDB database.
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.uri)
      await this.client.connect()
      this.db = this.client.db(process.env.MONGODB_DB || 'test_db')
    }
  }

  /**
   * Closes the MongoDB connection if it exists.
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  /**
   * Gets a MongoDB collection with the specified name.
   * @param name - The name of the collection to retrieve
   * @returns Collection instance for the specified name
   * @throws Error if database is not connected
   */
  getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db.collection<T>(name)
  }

  /**
   * Inserts a user document into the users collection.
   * @param user - The user document to insert
   * @returns Promise resolving to the inserted document's ID as a string
   */
  async insertUser(user: any): Promise<string> {
    const collection = this.getCollection('users')
    const result = await collection.insertOne(user)
    return result.insertedId.toString()
  }

  /**
   * Inserts a logo document into the logos collection.
   * @param logo - The logo document to insert
   * @returns Promise resolving to the inserted document's ID as a string
   */
  async insertLogo(logo: any): Promise<string> {
    const collection = this.getCollection('logos')
    const result = await collection.insertOne(logo)
    return result.insertedId.toString()
  }

  /**
   * Finds a user document matching the specified query.
   * @param query - The query to find the user
   * @returns Promise resolving to the found user document or null if not found
   */
  async findUser(query: any): Promise<any> {
    const collection = this.getCollection('users')
    return collection.findOne(query)
  }

  /**
   * Finds a logo document matching the specified query.
   * @param query - The query to find the logo
   * @returns Promise resolving to the found logo document or null if not found
   */
  async findLogo(query: any): Promise<any> {
    const collection = this.getCollection('logos')
    return collection.findOne(query)
  }

  /**
   * Deletes all documents from the specified collection.
   * @param name - The name of the collection to clear
   */
  async clearCollection(name: string): Promise<void> {
    const collection = this.getCollection(name)
    await collection.deleteMany({})
  }

  /**
   * Deletes all documents from multiple collections.
   * @param names - Array of collection names to clear
   */
  async clearCollections(names: string[]): Promise<void> {
    await Promise.all(names.map(name => this.clearCollection(name)));
  }

  /**
   * Deletes all documents from all collections in the database.
   */
  async clearDatabase(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    const collections = await this.db.listCollections().toArray()
    await Promise.all(collections.map(c => this.clearCollection(c.name)))
  }

  /**
   * Gets the MongoDB client instance.
   * @returns The MongoDB client
   */
  getClient(): MongoClient | null {
    return this.client
  }

  /**
   * Gets the MongoDB database instance.
   * @returns The MongoDB database
   */
  async getDb(): Promise<Db | null> {
    return this.db;
  }

  async isConnected(): Promise<boolean> {
    try {
      return this.client !== null && await this.client.db().command({ ping: 1 }).then(() => true).catch(() => false);
    } catch {
      return false;
    }
  }
}

export default TestDbHelper
import { MongoClient, Db, Collection, Document, WithId, Filter, OptionalUnlessRequiredId } from 'mongodb'
import { Logger } from '../../../scripts/utils/logger'

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
    this.uri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test_db'
  }

  /**
   * Establishes a connection to the MongoDB database.
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.uri, {
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        },
        monitorCommands: true,
        directConnection: true
      })
      await this.client.connect()
      this.db = this.client.db('test_db')
      // Simple connection test
      await this.db.listCollections().toArray()
      console.log('Connected to MongoDB successfully')
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
      throw error
    }
  }

  /**
   * Closes the MongoDB connection if it exists.
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close()
      } catch (error) {
        console.error('Failed to disconnect from MongoDB:', error)
        throw error
      } finally {
        this.client = null
        this.db = null
      }
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
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection<T>(name);
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
   * Clears all documents from a collection.
   * @param name - The name of the collection to clear
   */
  async clearCollection(name: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    const collection = this.getCollection(name)
    await collection.deleteMany({})
  }

  /**
   * Clears all documents from multiple collections.
   * @param collections - Array of collection names to clear
   */
  async clearCollections(collections: string[]): Promise<void> {
    if (!Array.isArray(collections)) {
      throw new Error('Collections must be an array')
    }
    for (const name of collections) {
      await this.clearCollection(name)
    }
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
   * Checks if the database connection is active.
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.client !== null && this.db !== null;
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
  getDb(): Db | null {
    return this.db;
  }

  async insertMany<T extends Document>(collectionName: string, documents: Omit<T, '_id'>[]): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const collection = this.getCollection<T>(collectionName);
      
      // Insert documents one by one, casting to the correct type
      for (const doc of documents) {
        await collection.insertOne(doc as OptionalUnlessRequiredId<T>);
      }
      Logger.info(`Inserted ${documents.length} documents into ${collectionName}`);

      // Verify documents were inserted
      const count = await collection.countDocuments();
      Logger.info(`Collection ${collectionName} now has ${count} documents`);
    } catch (error) {
      console.error(`Error inserting documents into ${collectionName}:`, error);
      throw error;
    }
  }

  async find<T extends Document>(collectionName: string, query = {}): Promise<WithId<T>[]> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }

    try {
      const collection = this.getCollection<T>(collectionName);
      
      // Use find() to get a cursor and convert to array
      const cursor = collection.find(query as Filter<T>);
      const documents = await cursor.toArray();
      
      Logger.info(`Retrieved ${documents.length} documents from ${collectionName}`);
      
      if (documents.length === 0) {
        Logger.info(`No documents found in ${collectionName}, listing all collections...`);
        const collections = await this.db.listCollections().toArray();
        Logger.info(`Available collections: ${collections.map(c => c.name).join(', ')}`);
      }
      
      return documents;
    } catch (error) {
      console.error(`Error finding documents in ${collectionName}:`, error);
      throw error;
    }
  }
}

export default TestDbHelper
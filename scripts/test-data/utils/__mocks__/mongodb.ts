import { Document, Collection, Db } from 'mongodb'

class ObjectId {
  private value: string

  constructor(value?: string) {
    this.value = value || Math.random().toString(36).substring(7)
  }

  toString() {
    return this.value
  }
}

class MockCollection<T extends Document> {
  private documents: T[] = []

  async insertOne(doc: T): Promise<{ insertedId: ObjectId; acknowledged: boolean }> {
    const id = new ObjectId()
    this.documents.push({ ...doc, _id: id } as T)
    return { insertedId: id, acknowledged: true }
  }

  async findOne(query: Partial<T>): Promise<T | null> {
    return this.documents.find(doc => 
      Object.entries(query).every(([key, value]) => doc[key as keyof T] === value)
    ) || null
  }

  async find(query: Partial<T> = {}): Promise<T[]> {
    return this.documents.filter(doc =>
      Object.entries(query).every(([key, value]) => doc[key as keyof T] === value)
    )
  }

  async updateOne(
    query: Partial<T>,
    update: { $set: Partial<T> }
  ): Promise<{ modifiedCount: number }> {
    const index = this.documents.findIndex(doc =>
      Object.entries(query).every(([key, value]) => doc[key as keyof T] === value)
    )
    if (index === -1) return { modifiedCount: 0 }
    
    this.documents[index] = { ...this.documents[index], ...update.$set }
    return { modifiedCount: 1 }
  }

  async deleteOne(query: Partial<T>): Promise<{ deletedCount: number }> {
    const initialLength = this.documents.length
    this.documents = this.documents.filter(doc =>
      !Object.entries(query).every(([key, value]) => doc[key as keyof T] === value)
    )
    return { deletedCount: initialLength - this.documents.length }
  }

  async deleteMany(query: Partial<T> = {}): Promise<{ deletedCount: number }> {
    const initialLength = this.documents.length
    this.documents = this.documents.filter(doc =>
      !Object.entries(query).every(([key, value]) => doc[key as keyof T] === value)
    )
    return { deletedCount: initialLength - this.documents.length }
  }

  async countDocuments(query: Partial<T> = {}): Promise<number> {
    return this.documents.filter(doc =>
      Object.entries(query).every(([key, value]) => doc[key as keyof T] === value)
    ).length
  }
}

class MockDb {
  private collectionMap: Map<string, MockCollection<any>> = new Map()

  collection<T extends Document>(name: string): Collection<T> {
    if (!this.collectionMap.has(name)) {
      this.collectionMap.set(name, new MockCollection<T>())
    }
    return this.collectionMap.get(name) as unknown as Collection<T>
  }

  async listCollections(): Promise<Collection[]> {
    return Array.from(this.collectionMap.values()) as unknown as Collection[]
  }
}

class MockMongoClient {
  private connected = false
  private mockDb: MockDb = new MockDb()

  async connect(): Promise<void> {
    this.connected = true
  }

  async close(): Promise<void> {
    this.connected = false
  }

  db(name?: string): Db {
    if (!this.connected) {
      throw new Error('Client must be connected before using')
    }
    return this.mockDb as unknown as Db
  }

  isConnected(): boolean {
    return this.connected
  }
}

export { MockMongoClient as MongoClient }
export { ObjectId }

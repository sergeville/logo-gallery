import { Collection, Db, MongoClient, ObjectId } from 'mongodb'
import type { Document } from 'mongodb'

export class MockObjectId {
  private id: string

  constructor(id?: string) {
    this.id = id || Math.random().toString(36).substring(2, 15)
  }

  toString() {
    return this.id
  }

  toHexString() {
    return this.id
  }

  equals(otherId: MockObjectId) {
    return this.id === otherId.toString()
  }

  static isValid(id: string) {
    return typeof id === 'string' && id.length > 0
  }
}

export class MockCollection<TDocument extends Document> {
  private documents: TDocument[] = []

  async insertOne(doc: TDocument) {
    const newDoc = { ...doc, _id: new MockObjectId() }
    this.documents.push(newDoc)
    return { insertedId: newDoc._id }
  }

  async findOne(query: any) {
    return this.documents.find(doc => {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'object' && value !== null && '_id' in value && typeof value._id === 'string') {
          if (doc._id.toString() !== value._id.toString()) return false
        } else if (doc[key] !== value) return false
      }
      return true
    }) || null
  }

  async find(query: any = {}) {
    const results = this.documents.filter(doc => {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'object' && value !== null && '_id' in value && typeof value._id === 'string') {
          if (doc._id.toString() !== value._id.toString()) return false
        } else if (doc[key] !== value) return false
      }
      return true
    })
    return {
      toArray: async () => results
    }
  }

  async updateOne(query: any, update: any) {
    const index = this.documents.findIndex(doc => {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'object' && value !== null && '_id' in value && typeof value._id === 'string') {
          if (doc._id.toString() !== value._id.toString()) return false
        } else if (doc[key] !== value) return false
      }
      return true
    })

    if (index === -1) return { modifiedCount: 0 }

    if (update.$set) {
      Object.assign(this.documents[index], update.$set)
    }
    if (update.$inc) {
      for (const [key, value] of Object.entries(update.$inc)) {
        const doc = this.documents[index] as Record<string, any>
        doc[key] = (doc[key] || 0) + value
      }
    }

    return { modifiedCount: 1 }
  }

  async deleteOne(query: any) {
    const index = this.documents.findIndex(doc => {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'object' && value !== null && '_id' in value && typeof value._id === 'string') {
          if (doc._id.toString() !== value._id.toString()) return false
        } else if (doc[key] !== value) return false
      }
      return true
    })

    if (index === -1) return { deletedCount: 0 }

    this.documents.splice(index, 1)
    return { deletedCount: 1 }
  }

  async deleteMany(query: any = {}) {
    const initialLength = this.documents.length
    this.documents = this.documents.filter(doc => {
      for (const [key, value] of Object.entries(query)) {
        if (typeof value === 'object' && value !== null && '_id' in value && typeof value._id === 'string') {
          if (doc._id.toString() !== value._id.toString()) return true
        } else if (doc[key] !== value) return true
      }
      return false
    })
    return { deletedCount: initialLength - this.documents.length }
  }

  async countDocuments(query: any = {}) {
    return (await this.find(query)).toArray().then(docs => docs.length)
  }
}

export class MockDb {
  private collections: { [key: string]: MockCollection<any> } = {}

  collection<T extends Document>(name: string): MockCollection<T> {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection<T>()
    }
    return this.collections[name]
  }

  async listCollections() {
    return Object.keys(this.collections).map(name => ({ name }))
  }
}

export class MockMongoClient {
  private mockDb: MockDb = new MockDb()
  private connected: boolean = false

  async connect() {
    this.connected = true
    return this
  }

  async close() {
    this.connected = false
  }

  getDb() {
    if (!this.connected) {
      throw new Error('Client must be connected before running operations')
    }
    return this.mockDb
  }
}

// Replace ObjectId with MockObjectId in tests
jest.mock('mongodb', () => ({
  ...jest.requireActual('mongodb'),
  ObjectId: function(id?: string) { return new MockObjectId(id) }
}))

export const connectToDatabase = async () => {
  const client = new MockMongoClient()
  await client.connect()
  const db = client.getDb()
  return { client, db }
} 
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
    await client.connect()
  }
  return client
}

export async function disconnectFromDatabase() {
  if (client) {
    await client.close()
    client = null
  }
}

export function getClient() {
  if (!client) {
    throw new Error('Database not connected')
  }
  return client
}

export function getDb() {
  if (!client) {
    throw new Error('Database not connected')
  }
  return client.db(process.env.MONGODB_DB || 'logo-gallery')
} 
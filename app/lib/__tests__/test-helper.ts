import { MongoClient, Db, ObjectId } from 'mongodb';
import { vi } from 'vitest';
import { connectToDatabase, disconnectFromDatabase } from '../db-config';
import path from 'path';
import fs from 'fs';

export class TestHelper {
  private static instance: TestHelper;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  static getInstance(): TestHelper {
    if (!TestHelper.instance) {
      TestHelper.instance = new TestHelper();
    }
    return TestHelper.instance;
  }

  async connect(): Promise<void> {
    if (!this.client) {
      process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/LogoGalleryTestDB';
      const { client, db } = await connectToDatabase();
      this.client = client;
      this.db = db;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await disconnectFromDatabase();
      this.client = null;
      this.db = null;
    }
  }

  async clearCollections(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const collections = await this.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }

  mockFileUpload(fileData: { name: string; type: string; size: number }): any {
    let imageBuffer: Buffer;
    try {
      const testImagePath = path.join(process.cwd(), 'test-assets', fileData.name);
      imageBuffer = fs.readFileSync(testImagePath);
    } catch (error) {
      // For test cases that don't need real image data
      if (fileData.type === 'application/pdf') {
        imageBuffer = Buffer.from('%PDF-1.4\n%test pdf content');
      } else {
        // Create a small valid PNG buffer for test cases
        imageBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
          0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
          0x49, 0x48, 0x44, 0x52, // "IHDR"
          0x00, 0x00, 0x00, 0x01, // width: 1
          0x00, 0x00, 0x00, 0x01, // height: 1
          0x08, // bit depth
          0x06, // color type: RGBA
          0x00, // compression method
          0x00, // filter method
          0x00, // interlace method
          0x1f, 0x15, 0xc4, 0x89, // IHDR CRC
          0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
          0x49, 0x44, 0x41, 0x54, // "IDAT"
          0x08, 0xd7, 0x63, 0x60, // compressed data
          0x60, 0x60, 0x00, 0x00, // more compressed data
          0x00, 0x03, 0x00, 0x01, // IDAT CRC
          0x00, 0x00, 0x00, 0x00, // IEND chunk length
          0x49, 0x45, 0x4E, 0x44, // "IEND"
          0xAE, 0x42, 0x60, 0x82  // IEND CRC
        ]);
      }
    }
    return {
      ...fileData,
      buffer: imageBuffer,
      data: imageBuffer // For MongoDB storage compatibility
    };
  }

  async createTestUser(data: any = {}): Promise<any> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const user = {
      email: data.email || 'test@example.com',
      username: data.username || 'testuser',
      password: data.password || 'password123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await this.db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async createTestLogo(userId: string, data: any = {}): Promise<any> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const logo = {
      title: data.title || 'Test Logo',
      description: data.description || 'Test Description',
      tags: data.tags || ['test'],
      userId: new ObjectId(userId),
      url: data.url || 'https://example.com/test.png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await this.db.collection('logos').insertOne(logo);
    return { ...logo, _id: result.insertedId };
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Database not connected');
    }
    return this.client;
  }
} 
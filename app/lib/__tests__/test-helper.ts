import { MongoClient, Db, ObjectId } from 'mongodb';
import { vi } from 'vitest';
import { connectToDatabase, disconnectFromDatabase } from '../db-config';
import path from 'path';
import fs from 'fs';
import type { FileUpload, ImageMetadata, UserData } from '../types';

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

  mockFileUpload(options: {
    name: string;
    type: string;
    size: number;
  }): FileUpload {
    return {
      name: options.name,
      type: options.type,
      size: options.size,
      buffer: Buffer.from('test-image-data'),
    };
  }

  private calculateCrc32(data: Buffer): number {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ this.crcTable[(crc ^ data[i]) & 0xFF];
    }
    return ~crc;
  }

  private deflateSync(data: Buffer): Buffer {
    const zlib = require('zlib');
    return zlib.deflateSync(data);
  }

  private crcTable: number[] = (() => {
    const crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      crcTable[n] = c;
    }
    return crcTable;
  })();

  async createTestUser(data: Partial<UserData> = {}): Promise<UserData> {
    const defaultUser: UserData = {
      _id: new ObjectId(),
      email: `test-${Date.now()}@example.com`,
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };

    await this.getDb().collection('users').insertOne(defaultUser);
    return defaultUser;
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

  generateImageMetadata(data: Partial<ImageMetadata> = {}): ImageMetadata {
    return {
      width: 800,
      height: 600,
      format: 'png',
      size: 1024 * 100,
      ...data
    };
  }
} 
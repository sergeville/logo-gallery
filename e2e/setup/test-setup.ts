import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';
import { Page } from '@playwright/test';

// Load test environment variables
config({ path: path.resolve(process.cwd(), '.env.test') });

// MongoDB test setup
export async function setupTestDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Clear test database
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    // Insert test data
    await db.collection('users').insertOne({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
      role: 'user'
    });
    
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Mock external services
export async function setupMockServices(page: Page) {
  if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
    await page.route('**/api/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'mocked_response' })
      });
    });
  }
}

// Test environment validation
export function validateTestEnvironment() {
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'TEST_USER_EMAIL',
    'TEST_USER_PASSWORD'
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required test environment variables: ${missing.join(', ')}`);
  }
}

// Global test setup
export async function setupTestEnvironment() {
  try {
    validateTestEnvironment();
    await setupTestDatabase();
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Test environment setup failed:', error);
    process.exit(1);
  }
} 
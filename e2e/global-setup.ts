import { FullConfig } from '@playwright/test';
import { connectToDatabase } from '@/lib/mongodb';

async function globalSetup(config: FullConfig) {
  const { client, db } = await connectToDatabase();
  
  // Clear test data
  await db.collection('logos').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('comments').deleteMany({});
  
  // Create test data
  await db.collection('users').insertOne({
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword123',
    role: 'user'
  });
  
  await client.close();
}

export default globalSetup; 
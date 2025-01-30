import { FullConfig } from '@playwright/test';
import { connectToDatabase } from '@/lib/mongodb';

async function globalTeardown(config: FullConfig) {
  const { client, db } = await connectToDatabase();
  
  // Clean up test data
  await db.collection('logos').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('comments').deleteMany({});
  
  await client.close();
}

export default globalTeardown; 
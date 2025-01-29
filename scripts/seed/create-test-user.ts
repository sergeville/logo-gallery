import { connectToDatabase } from '@/app/lib/db';
import bcrypt from 'bcrypt';
import { User } from '@/app/lib/types';

const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date()
};

async function createTestUser() {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // Create user
    const result = await usersCollection.insertOne({
      ...testUser,
      password: hashedPassword
    });

    console.log('Test user created successfully:', result.insertedId);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 
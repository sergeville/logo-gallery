import { connectToDatabase } from '../../app/lib/db';
import bcryptjs from 'bcryptjs';
import { User } from '../../app/lib/types';
import { Db } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function validateLogin(email: string, password: string, db: Db) {
  const user = await db.collection('users').findOne({ email });
  if (!user) {
    return false;
  }
  return bcryptjs.compare(password, user.password);
}

async function createUser(email: string, password: string) {
  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      // Delete the existing user to recreate it
      await usersCollection.deleteOne({ email });
      console.log('Deleted existing user');
    }

    // Hash password using bcryptjs (same as auth system)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = {
      email,
      password: hashedPassword,
      name: email.split('@')[0],
      role: 'ADMIN',
      profile: {
        avatarUrl: `https://www.gravatar.com/avatar/${email}?d=mp`,
        bio: 'System Administrator'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create user
    const result = await usersCollection.insertOne(user);
    console.log('User created successfully:', result.insertedId);

    // Validate login
    console.log('Validating login...');
    const canLogin = await validateLogin(email, password, db);
    if (canLogin) {
      console.log('✅ Login validation successful - user can sign in with provided credentials');
    } else {
      console.error('❌ Login validation failed - user cannot sign in with provided credentials');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: npm run create-user <email> <password>');
  process.exit(1);
}

createUser(email, password); 
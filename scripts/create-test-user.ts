import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase, disconnectFromDatabase } from '../app/lib/db';
import { hashPassword } from '../app/lib/auth';

async function addUser(email: string, password: string, name: string) {
  const { db } = await connectToDatabase();
  const collection = db.collection('users');

  const hashedPassword = await hashPassword(password);
  const user = {
    _id: new ObjectId(),
    email,
    password: hashedPassword,
    name,
    role: 'user',
    createdAt: new Date()
  };

  await collection.insertOne(user);
  await disconnectFromDatabase();
  return user._id.toString();
}

async function main() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4];

    if (!email || !password || !name) {
      console.error('Usage: npm run create-test-user <email> <password> <name>');
      process.exit(1);
    }

    const userId = await addUser(email, password, name);
    console.log(`Created test user with ID: ${userId}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

main(); 
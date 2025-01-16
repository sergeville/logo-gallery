import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '../../app/lib/db';

const users = [
  {
    email: 'john.doe@example.com',
    name: 'John Doe',
    bio: 'Professional graphic designer with 5 years experience'
  },
  {
    email: 'sarah.smith@example.com',
    name: 'Sarah Smith',
    bio: 'Creative director and brand consultant'
  },
  {
    email: 'mike.wilson@example.com',
    name: 'Mike Wilson',
    bio: 'Freelance logo designer and illustrator'
  },
  {
    email: 'emma.brown@example.com',
    name: 'Emma Brown',
    bio: 'Digital artist specializing in minimalist designs'
  },
  {
    email: 'david.lee@example.com',
    name: 'David Lee',
    bio: 'Brand identity designer and consultant'
  },
  {
    email: 'lisa.garcia@example.com',
    name: 'Lisa Garcia',
    bio: 'UI/UX designer with a passion for logos'
  },
  {
    email: 'james.taylor@example.com',
    name: 'James Taylor',
    bio: 'Typography specialist and logo creator'
  },
  {
    email: 'amy.chen@example.com',
    name: 'Amy Chen',
    bio: 'Visual designer and brand strategist'
  },
  {
    email: 'robert.miller@example.com',
    name: 'Robert Miller',
    bio: 'Senior brand designer with Fortune 500 experience'
  },
  {
    email: 'maria.rodriguez@example.com',
    name: 'Maria Rodriguez',
    bio: 'Creative artist focusing on modern logo design'
  }
];

async function seedUsers() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('users');

    const hashedPassword = await bcrypt.hash('password123', 12);
    const timestamp = new Date();

    const userDocs = users.map(user => ({
      _id: new ObjectId(),
      ...user,
      password: hashedPassword,
      profile: {
        avatarUrl: `https://www.gravatar.com/avatar/${Buffer.from(user.email).toString('hex')}?d=mp`,
        bio: user.bio
      },
      createdAt: timestamp,
      updatedAt: timestamp
    }));

    await collection.insertMany(userDocs);
    console.log('Successfully added 10 test users');

  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

seedUsers(); 
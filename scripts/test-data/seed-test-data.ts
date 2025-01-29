import { MongoClient, ObjectId } from 'mongodb';
import connectToDatabase, { disconnectFromDatabase } from '@/app/lib/db';
import { hashPassword } from '@/app/lib/auth';
import { validateUser, validateLogo } from '@/scripts/test-data/utils/model-validators';
import chalk from 'chalk';

interface TestUser {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
}

interface TestLogo {
  _id: ObjectId;
  name: string;
  url: string;
  description: string;
  userId: ObjectId;
  createdAt: Date;
}

async function seedTestData() {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');
  const logosCollection = db.collection('logos');

  // Clear existing data
  await usersCollection.deleteMany({});
  await logosCollection.deleteMany({});

  // Create test user
  const testUser = {
    _id: new ObjectId(),
    email: 'test@example.com',
    password: await hashPassword('Test123!'),
    name: 'Test User',
    role: 'user',
    createdAt: new Date(),
    profile: {
      avatarUrl: '/default-avatar.svg',
      bio: 'Test user for development'
    }
  };

  await usersCollection.insertOne(testUser);
  console.log(chalk.green(`Created test user: ${testUser.email}`));

  // Create test users
  const users: TestUser[] = [];
  for (let i = 1; i <= 5; i++) {
    const user: TestUser = {
      _id: new ObjectId(),
      email: `user${i}@example.com`,
      password: await hashPassword('password123'),
      name: `Test User ${i}`,
      role: 'user',
      createdAt: new Date()
    };

    const validationResult = validateUser(user);
    if (validationResult.errors.length > 0) {
      console.error(chalk.red(`Invalid user data for user${i}:`));
      validationResult.errors.forEach(error => {
        console.error(chalk.red(`  • ${error.message}`));
      });
      continue;
    }

    await usersCollection.insertOne(user);
    users.push(user);
    console.log(chalk.green(`Created test user: ${user.email}`));
  }

  // Create test logos
  const logos: TestLogo[] = [];
  for (const user of users) {
    for (let i = 1; i <= 3; i++) {
      const logo: TestLogo = {
        _id: new ObjectId(),
        name: `Test Logo ${i} for ${user.name}`,
        url: `https://example.com/logos/logo${i}.png`,
        description: `A beautiful test logo number ${i} created by ${user.name}`,
        userId: user._id,
        createdAt: new Date()
      };

      const validationResult = validateLogo(logo);
      if (validationResult.errors.length > 0) {
        console.error(chalk.red(`Invalid logo data for logo${i}:`));
        validationResult.errors.forEach(error => {
          console.error(chalk.red(`  • ${error.message}`));
        });
        continue;
      }

      await logosCollection.insertOne(logo);
      logos.push(logo);
      console.log(chalk.green(`Created test logo: ${logo.name}`));
    }
  }

  console.log(chalk.blue('\nSeed data summary:'));
  console.log(chalk.white(`• Created ${users.length} test users`));
  console.log(chalk.white(`• Created ${logos.length} test logos`));

  await disconnectFromDatabase();
}

async function main() {
  try {
    await seedTestData();
    console.log(chalk.green('\nTest data seeded successfully!'));
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Error seeding test data:'), error);
    process.exit(1);
  }
}

main(); 
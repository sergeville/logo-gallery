import { MongoClient, ObjectId } from 'mongodb';
import { userValidationRules, logoValidationRules } from './utils/validation-rules';
import { validateField } from './utils/validation-rules';

interface User {
  _id: ObjectId;
  email: string;
  username: string;
  name: string;
  profile: {
    website?: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
  };
  role: string;
  status: string;
  lastLogin: Date;
  [key: string]: any;
}

interface Logo {
  _id: ObjectId;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  ownerId: ObjectId;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  metadata: {
    version: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  colors?: string[];
  [key: string]: any;
}

const generateTestUsers = (count: number): User[] => {
  const users: User[] = [];
  const roles = ['user', 'admin', 'moderator'];
  const statuses = ['active', 'inactive', 'pending'];

  for (let i = 0; i < count; i++) {
    const user: User = {
      _id: new ObjectId(),
      email: `user${i}@test.com`,
      username: `testuser${i}`,
      name: `Test User ${i}`,
      profile: {
        website: i % 2 === 0 ? `https://user${i}.test.com` : undefined,
        avatarUrl: `https://avatars.test.com/user${i}.jpg`,
        bio: `Bio for test user ${i}`,
        location: `City ${i}, Country`
      },
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      lastLogin: new Date()
    };

    // Validate user data
    for (const rule of userValidationRules) {
      const value = rule.field.includes('.')
        ? rule.field.split('.').reduce((obj, key) => obj?.[key], user)
        : user[rule.field];
      
      if (!validateField(value, rule)) {
        console.warn(`Warning: Generated user data fails validation for ${rule.field}`);
      }
    }

    users.push(user);
  }

  return users;
};

const generateTestLogos = (users: User[], count: number): Logo[] => {
  const logos: Logo[] = [];
  const categories = [
    'Technology', 'Business', 'Creative', 'Education',
    'Entertainment', 'Food & Beverage', 'Health', 'Sports'
  ];

  for (let i = 0; i < count; i++) {
    const owner = users[i % users.length];
    const logo: Logo = {
      _id: new ObjectId(),
      name: `Test Logo ${i}`,
      description: `Description for test logo ${i}`,
      imageUrl: `https://logos.test.com/logo${i}.png`,
      thumbnailUrl: `https://logos.test.com/logo${i}-thumb.png`,
      ownerId: owner._id,
      category: categories[i % categories.length],
      tags: ['logo', 'test', `tag${i}`],
      dimensions: {
        width: 800,
        height: 600
      },
      fileSize: 250 * 1024, // 250KB
      fileType: 'png',
      metadata: {
        version: '1.0.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      colors: ['#FF0000', '#00FF00', '#0000FF']
    };

    // Validate logo data
    for (const rule of logoValidationRules) {
      const value = rule.field.includes('.')
        ? rule.field.split('.').reduce((obj, key) => obj?.[key], logo)
        : logo[rule.field];
      
      if (!validateField(value, rule)) {
        console.warn(`Warning: Generated logo data fails validation for ${rule.field}`);
      }
    }

    logos.push(logo);
  }

  return logos;
};

async function seedTestData() {
  const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/LogoGalleryTest';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB test database');

    const db = client.db();
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('logos').deleteMany({});
    console.log('Cleared existing test data');

    // Generate and insert test data
    const users = generateTestUsers(10);
    const logos = generateTestLogos(users, 30);

    await db.collection('users').insertMany(users);
    await db.collection('logos').insertMany(logos);
    console.log('Inserted test data');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('logos').createIndex({ name: 1, ownerId: 1 }, { unique: true });
    await db.collection('logos').createIndex({ category: 1 });
    await db.collection('logos').createIndex({ tags: 1 });
    console.log('Created indexes');

  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding script if this file is executed directly
if (require.main === module) {
  seedTestData()
    .then(() => console.log('Test data seeding completed'))
    .catch(error => {
      console.error('Test data seeding failed:', error);
      process.exit(1);
    });
} 
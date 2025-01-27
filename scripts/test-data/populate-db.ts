import { MongoClient, ObjectId } from 'mongodb';
import { generateSpecificUsers, generateUsers, IUser } from './utils/user-generator';
import { generateSpecificLogos, generateLogos, ILogo } from './utils/logo-generator';

async function populateTestDatabase() {
  const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/LogoGalleryTest';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('logos').deleteMany({});

    // Insert specific users (e.g., admin, moderator)
    const specificUsers = generateSpecificUsers().map(user => ({
      ...user,
      _id: new ObjectId(user._id)
    }));
    await db.collection('users').insertMany(specificUsers);

    // Insert random users
    const randomUsers = generateUsers(20).map(user => ({
      ...user,
      _id: new ObjectId(user._id)
    }));
    await db.collection('users').insertMany(randomUsers);

    // Get all user IDs
    const users = await db.collection('users').find().toArray();
    const userIds = users.map(user => user._id);

    // Insert specific logos for each designer user
    const designerUsers = users.filter(user => user.role === 'designer');
    for (const designerUser of designerUsers) {
      const specificLogos = generateSpecificLogos(designerUser._id as ObjectId).map(logo => ({
        ...logo,
        _id: new ObjectId(logo._id),
        userId: new ObjectId(logo.userId)
      }));
      await db.collection('logos').insertMany(specificLogos);
    }

    // Insert random logos
    const randomLogos = generateLogos(userIds as ObjectId[], 50).map(logo => ({
      ...logo,
      _id: new ObjectId(logo._id),
      userId: new ObjectId(logo.userId)
    }));
    await db.collection('logos').insertMany(randomLogos);

    console.log('Test database populated successfully');
  } catch (error) {
    console.error('Error populating test database:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the population script if this file is executed directly
if (require.main === module) {
  populateTestDatabase().catch(console.error);
}

export { populateTestDatabase }; 
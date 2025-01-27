import { ObjectId } from 'mongodb';
import { connectToDatabase, disconnectFromDatabase } from '../../lib/db';
import { ILogo } from '../test-data/utils/logo-generator';
import { createLogo } from './seed-utils';

async function seedLogos() {
  const { db } = await connectToDatabase();

  try {
    // Clear existing logos
    await db.collection('logos').deleteMany({});

    // Get all users
    const users = await db.collection('users').find().toArray();

    // Create logos for each user
    const logos: ILogo[] = [];
    for (const user of users) {
      const userLogos = Array.from({ length: 3 }, (_, i) => createLogo(user._id, i + 1));
      logos.push(...userLogos);
    }

    // Insert all logos
    await db.collection('logos').insertMany(logos);
    console.log(`Seeded ${logos.length} logos`);
  } catch (error) {
    console.error('Error seeding logos:', error);
    throw error;
  } finally {
    await disconnectFromDatabase();
  }
}

// Run the seeding script if this file is executed directly
if (require.main === module) {
  seedLogos().catch(console.error);
}

export { seedLogos }; 
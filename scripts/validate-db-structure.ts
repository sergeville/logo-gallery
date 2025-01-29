import { MongoClient } from 'mongodb';
import { getConfig } from '@/config/environments';
import { User } from '@/lib/models/User';
import { Logo } from '@/lib/models/Logo';

async function validateDatabaseStructure() {
  const config = getConfig();
  const client = new MongoClient(config.mongodb.uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(config.mongodb.dbName);

    // Validate collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\nChecking collections...');
    ['users', 'logos'].forEach(collection => {
      if (collectionNames.includes(collection)) {
        console.log(`✅ Collection '${collection}' exists`);
      } else {
        console.error(`❌ Collection '${collection}' is missing`);
      }
    });

    // Validate indexes
    console.log('\nChecking indexes...');
    
    const userIndexes = await db.collection('users').indexes();
    console.log('\nUser Indexes:');
    userIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    const logoIndexes = await db.collection('logos').indexes();
    console.log('\nLogo Indexes:');
    logoIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Validate relationships
    console.log('\nChecking relationships...');
    const logos = await db.collection('logos').find({}).toArray();
    const userIds = new Set((await db.collection('users').find({}).toArray()).map(u => u._id.toString()));
    
    const orphanedLogos = logos.filter(logo => !userIds.has(logo.ownerId.toString()));
    if (orphanedLogos.length > 0) {
      console.error(`❌ Found ${orphanedLogos.length} logos with invalid owner references`);
      orphanedLogos.forEach(logo => {
        console.error(`  - Logo ${logo._id}: references non-existent user ${logo.ownerId}`);
      });
    } else {
      console.log('✅ All logo owner references are valid');
    }

    // Validate required fields
    console.log('\nChecking required fields...');
    
    const usersWithMissingFields = await db.collection('users').find({
      $or: [
        { email: { $exists: false } },
        { username: { $exists: false } },
        { name: { $exists: false } }
      ]
    }).toArray();

    if (usersWithMissingFields.length > 0) {
      console.error(`❌ Found ${usersWithMissingFields.length} users with missing required fields`);
    } else {
      console.log('✅ All users have required fields');
    }

    const logosWithMissingFields = await db.collection('logos').find({
      $or: [
        { name: { $exists: false } },
        { imageUrl: { $exists: false } },
        { thumbnailUrl: { $exists: false } },
        { ownerId: { $exists: false } },
        { category: { $exists: false } },
        { dimensions: { $exists: false } },
        { fileSize: { $exists: false } },
        { fileType: { $exists: false } }
      ]
    }).toArray();

    if (logosWithMissingFields.length > 0) {
      console.error(`❌ Found ${logosWithMissingFields.length} logos with missing required fields`);
    } else {
      console.log('✅ All logos have required fields');
    }

  } catch (error) {
    console.error('Error validating database structure:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
if (require.main === module) {
  validateDatabaseStructure().catch(console.error);
} 
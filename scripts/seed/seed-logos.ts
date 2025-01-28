import { MongoClient, ObjectId } from 'mongodb';
import { ILogo } from '../test-data/utils/logo-generator';

async function seedLogos() {
  const uri = 'mongodb://localhost:27017/LogoGalleryDevelopmentDB';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    const logosCollection = db.collection('logos');

    // Get all users
    const users = await usersCollection.find().toArray();

    const logos: ILogo[] = [];
    const timestamp = new Date();

    // Generate 3 logos for each user
    for (const user of users) {
      const userLogos = [
        {
          _id: new ObjectId(),
          name: `${user.name}'s Tech Logo`,
          description: 'Modern and sleek technology company logo',
          imageUrl: 'https://placehold.co/600x400/2563eb/ffffff?text=Tech+Logo',
          thumbnailUrl: 'https://placehold.co/300x200/2563eb/ffffff?text=Tech+Logo',
          url: 'https://placehold.co/600x400/2563eb/ffffff?text=Tech+Logo',
          userId: user._id,
          ownerName: user.name,
          category: 'Technology',
          tags: ['tech', 'modern', 'minimalist'],
          dimensions: { width: 600, height: 400 },
          fileSize: 256 * 1024,
          fileType: 'png',
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          _id: new ObjectId(),
          name: `${user.name}'s Creative Logo`,
          description: 'Artistic and colorful creative agency logo',
          imageUrl: 'https://placehold.co/600x400/dc2626/ffffff?text=Creative+Logo',
          thumbnailUrl: 'https://placehold.co/300x200/dc2626/ffffff?text=Creative+Logo',
          url: 'https://placehold.co/600x400/dc2626/ffffff?text=Creative+Logo',
          userId: user._id,
          ownerName: user.name,
          category: 'Creative',
          tags: ['creative', 'artistic', 'colorful'],
          dimensions: { width: 600, height: 400 },
          fileSize: 192 * 1024,
          fileType: 'png',
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          _id: new ObjectId(),
          name: `${user.name}'s Business Logo`,
          description: 'Professional and corporate business logo',
          imageUrl: 'https://placehold.co/600x400/16a34a/ffffff?text=Business+Logo',
          thumbnailUrl: 'https://placehold.co/300x200/16a34a/ffffff?text=Business+Logo',
          url: 'https://placehold.co/600x400/16a34a/ffffff?text=Business+Logo',
          userId: user._id,
          ownerName: user.name,
          category: 'Business',
          tags: ['business', 'professional', 'corporate'],
          dimensions: { width: 600, height: 400 },
          fileSize: 224 * 1024,
          fileType: 'png',
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ];

      logos.push(...userLogos);
    }

    await logosCollection.insertMany(logos);
    console.log(`Successfully added ${logos.length} logos for ${users.length} users`);

  } catch (error) {
    console.error('Error seeding logos:', error);
  } finally {
    await client.close();
  }
}

seedLogos(); 
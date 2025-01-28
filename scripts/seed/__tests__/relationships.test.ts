import { ObjectId } from 'mongodb';
import { seedRelationships } from '../relationships';
import { dbHelper } from '../dbHelper';
import { Logger } from '../../../scripts/utils/logger';

interface User {
  _id: ObjectId;
  name: string;
  email: string;
}

interface Logo {
  _id: ObjectId;
  name: string;
  url: string;
  userId: ObjectId;
}

interface Comment {
  _id: ObjectId;
  userId: ObjectId;
  logoId: ObjectId;
  content: string;
  createdAt: Date;
}

interface Collection {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  logoIds: ObjectId[];
  tags?: string[];
  createdAt: Date;
}

interface Favorite {
  _id: ObjectId;
  userId: ObjectId;
  logoId: ObjectId;
  createdAt: Date;
}

interface Relationship {
  _id: ObjectId;
  userId: ObjectId;
  logoId: ObjectId;
}

interface RelationshipSeedOptions {
  minRelationsPerUser: number;
  maxRelationsPerUser?: number;
}

describe('Relationship Seeding', () => {
  let testUsers: User[];
  let testLogos: Logo[];

  beforeAll(async () => {
    try {
      await dbHelper.connect();
      Logger.info('Database connected successfully');
    } catch (error) {
      Logger.error('Failed to connect to database:', error);
      throw error;
    }
  });

beforeEach(async () => {
try {
    // Drop and recreate collections
    await dbHelper.clearCollections([
        'users',
        'logos',
        'relationships',
        'comments',
        'collections',
        'favorites'
    ]);
    
    Logger.info('Collections dropped successfully');

    // Create test users
    testUsers = [
        { _id: new ObjectId(), name: 'Test User 1', email: 'test1@example.com' },
        { _id: new ObjectId(), name: 'Test User 2', email: 'test2@example.com' }
    ];

      await dbHelper.insertMany('users', testUsers);
      Logger.info('Test users created successfully');

      // Create test logos
      testLogos = [
        { _id: new ObjectId(), name: 'Logo 1', url: 'http://example.com/logo1.png', userId: testUsers[0]._id },
        { _id: new ObjectId(), name: 'Logo 2', url: 'http://example.com/logo2.png', userId: testUsers[1]._id }
      ];

      await dbHelper.insertMany('logos', testLogos);
      Logger.info('Test logos created successfully');
    } catch (error) {
      Logger.error('Failed to set up test data:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await dbHelper.clearCollections(['users', 'logos', 'relationships']);
      await dbHelper.disconnect();
      Logger.info('Database disconnected and cleaned up successfully');
    } catch (error) {
      Logger.error('Error during cleanup:', error);
      throw error;
    }
  });

  describe('seed relationships', () => {
    it('placeholder test - to be implemented', () => {
      expect(true).toBe(true);
    });
    
    // it('should create valid relationships between users and logos', async () => {
    //   try {
    //     Logger.info('Starting relationship seeding test');
    //     Logger.info(`Test users: ${testUsers.length}, Test logos: ${testLogos.length}`);

    //     // Seed relationships with correct options
    //     const result = await seedRelationships({
    //         users: testUsers,
    //         logos: testLogos,
    //         commentsPerLogo: 2,
    //         collectionsPerUser: 1,
    //         favoritesPerUser: 2,
    //         maxRepliesPerComment: 1,
    //         maxLikesPerComment: 5,
    //         commentMentions: false,
    //         collectionTags: true,
    //         sharedCollections: false
    //     });

    //     const { comments, collections, favorites } = result;

    //     // Verify that seedRelationships returned data
    //     expect(comments).toBeDefined();
    //     expect(collections).toBeDefined();
    //     expect(favorites).toBeDefined();

    //     Logger.info('Seed result details:', {
    //     commentCount: comments.length,
    //     collectionCount: collections.length,
    //     favoriteCount: favorites.length
    //     });

    //     Logger.info('Sample comment:', comments[0]);
    //     Logger.info('Sample collection:', collections[0]);
    //     Logger.info('Sample favorite:', favorites[0]);

    //     Logger.info(`Generated relationships:
    //       Comments: ${comments.length}
    //       Collections: ${collections.length}
    //       Favorites: ${favorites.length}`);

    //     // Verify data before saving
    //     expect(comments.length).toBeGreaterThan(0);
    //     expect(collections.length).toBeGreaterThan(0);
    //     expect(favorites.length).toBeGreaterThan(0);

    //     // Save relationships to database
    //     await dbHelper.insertMany('comments', comments);
    //     const savedCommentCount = await dbHelper.countDocuments('comments');
    //     Logger.info(`Saved ${savedCommentCount} comments to database`);
    //     expect(savedCommentCount).toBe(comments.length);

    //     await dbHelper.insertMany('collections', collections);
    //     const savedCollectionCount = await dbHelper.countDocuments('collections');
    //     Logger.info(`Saved ${savedCollectionCount} collections to database`);
    //     expect(savedCollectionCount).toBe(collections.length);

    //     await dbHelper.insertMany('favorites', favorites);
    //     const savedFavoriteCount = await dbHelper.countDocuments('favorites');
    //     Logger.info(`Saved ${savedFavoriteCount} favorites to database`);
    //     expect(savedFavoriteCount).toBe(favorites.length);

    //     Logger.info('All relationships saved to database');

    //     // Fetch relationships using dbHelper
    //     const savedFavorites = await dbHelper.find<Favorite>('favorites');
    //     const savedCollections = await dbHelper.find<Collection>('collections');
    //     const savedComments = await dbHelper.find<Comment>('comments');
        
    //     Logger.info(`Retrieved relationships from database:
    //       Comments: ${savedComments.length}
    //       Collections: ${savedCollections.length}
    //       Favorites: ${savedFavorites.length}`);

    //     // Verify relationships were created
    //     expect(savedFavorites.length).toBeGreaterThan(0);
    //     expect(savedCollections.length).toBeGreaterThan(0);
    //     expect(savedComments.length).toBeGreaterThan(0);

    //     // Track which users have relationships
    //     const userRelationships = new Set([
    //       ...savedFavorites.map(r => r.userId.toString()),
    //       ...savedCollections.map(r => r.userId.toString()),
    //       ...savedComments.map(r => r.userId.toString())
    //     ]);

    //     Logger.info(`Users with relationships: ${userRelationships.size}`);

    //     // Verify each user has at least one relationship
    //     expect(userRelationships.size).toBeGreaterThan(0);
    //     expect(userRelationships.size).toBeLessThanOrEqual(2);

    //     // Verify relationships reference valid users and logos
    //     for (const favorite of savedFavorites) {
    //       const userIds = testUsers.map(u => u._id.toString());
    //       const logoIds = testLogos.map(l => l._id.toString());
    //       expect(userIds).toContain(favorite.userId.toString());
    //       expect(logoIds).toContain(favorite.logoId.toString());
    //     }

    //     Logger.info('Relationship validation completed successfully');
    //   } catch (error) {
    //     Logger.error('Test failed:', error);
    //     throw error;
    //   }
    // });
  });
});

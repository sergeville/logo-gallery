import { DatabaseHelper } from '../db-helper';
import { ObjectId } from 'mongodb';
import { User } from '../users';
import { Logo } from '../logos';
import { Comment, Collection, Favorite } from '../relationships';

describe('DatabaseHelper', () => {
  let dbHelper: DatabaseHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    await dbHelper.connect();
  });

  afterAll(async () => {
    await dbHelper.disconnect();
  });

  beforeEach(async () => {
    await dbHelper.clearCollections();
  });

  describe('seedTestData', () => {
    it('should seed complete test data', async () => {
      await dbHelper.seedTestData({
        userCount: 3,
        logoCount: 5,
        commentsPerLogo: 2,
        collectionsPerUser: 1,
        favoritesPerUser: 2
      });

      // Verify data was seeded
      const db = (dbHelper as any).db;
      
      const users = await db.collection('users').find({}).toArray() as User[];
      expect(users).toHaveLength(3);
      users.forEach((user: User) => {
        expect(user._id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.profile).toBeDefined();
      });

      const logos = await db.collection('logos').find({}).toArray() as Logo[];
      expect(logos).toHaveLength(5);
      logos.forEach((logo: Logo) => {
        expect(logo._id).toBeDefined();
        expect(logo.name).toBeDefined();
        expect(users.some((u: User) => u._id.equals(logo.userId))).toBe(true);
      });

      const comments = await db.collection('comments').find({}).toArray() as Comment[];
      expect(comments.length).toBeGreaterThanOrEqual(logos.length * 2);
      comments.forEach((comment: Comment) => {
        expect(comment._id).toBeDefined();
        expect(logos.some((l: Logo) => l._id.equals(comment.logoId))).toBe(true);
        expect(users.some((u: User) => u._id.equals(comment.userId))).toBe(true);
      });

      const collections = await db.collection('collections').find({}).toArray() as Collection[];
      expect(collections.length).toBeGreaterThanOrEqual(users.length);
      collections.forEach((collection: Collection) => {
        expect(collection._id).toBeDefined();
        expect(users.some((u: User) => u._id.equals(collection.userId))).toBe(true);
        expect(collection.logos.length).toBeGreaterThan(0);
        collection.logos.forEach(logoId => {
          expect(logos.some(l => l._id.equals(logoId))).toBe(true);
        });
      });

      const favorites = await db.collection('favorites').find({}).toArray() as Favorite[];
      expect(favorites.length).toBeGreaterThanOrEqual(users.length * 2);
      favorites.forEach((favorite: Favorite) => {
        expect(favorite._id).toBeDefined();
        expect(users.some((u: User) => u._id.equals(favorite.userId))).toBe(true);
        expect(logos.some((l: Logo) => l._id.equals(favorite.logoId))).toBe(true);
      });
    });
  });

  describe('clearCollections', () => {
    it('should clear all collections', async () => {
      // First seed some data
      await dbHelper.seedTestData({
        userCount: 2,
        logoCount: 3,
        commentsPerLogo: 1,
        collectionsPerUser: 1,
        favoritesPerUser: 1
      });

      // Then clear it
      await dbHelper.clearCollections();

      // Verify all collections are empty
      const db = (dbHelper as any).db;
      const collections = ['users', 'logos', 'comments', 'collections', 'favorites'];
      
      for (const collectionName of collections) {
        const count = await db.collection(collectionName).countDocuments();
        expect(count).toBe(0);
      }
    });
  });

  describe('createIndexes', () => {
    it('should create all required indexes', async () => {
      await dbHelper.createIndexes();
      const db = (dbHelper as any).db;

      const userIndexes = await db.collection('users').indexes();
      expect(userIndexes.some((idx: any) => idx.key.email)).toBe(true);
      expect(userIndexes.some((idx: any) => idx.key.username)).toBe(true);

      const logoIndexes = await db.collection('logos').indexes();
      expect(logoIndexes.some((idx: any) => idx.key.userId)).toBe(true);
      expect(logoIndexes.some((idx: any) => idx.key.tags)).toBe(true);

      const favoriteIndexes = await db.collection('favorites').indexes();
      expect(favoriteIndexes.some((idx: any) => 
        idx.key.userId && idx.key.logoId && idx.unique
      )).toBe(true);
    });
  });
}); 
import { ObjectId } from 'mongodb';
import { 
  seedComments, 
  seedCollections, 
  seedFavorites,
  seedRelationships 
} from '../relationships';

describe('Relationship Seeding', () => {
  const mockUsers = [
    { _id: new ObjectId() },
    { _id: new ObjectId() },
    { _id: new ObjectId() }
  ];

  const mockLogos = [
    { _id: new ObjectId() },
    { _id: new ObjectId() },
    { _id: new ObjectId() }
  ];

  describe('seedComments', () => {
    it('should generate the specified number of comments per logo', async () => {
      const commentsPerLogo = 2;
      const comments = await seedComments({ 
        users: mockUsers, 
        logos: mockLogos,
        commentsPerLogo
      });

      expect(comments.length).toBeGreaterThanOrEqual(mockLogos.length * commentsPerLogo);
    });

    it('should generate comments with valid references', async () => {
      const comments = await seedComments({ 
        users: mockUsers, 
        logos: mockLogos 
      });

      comments.forEach(comment => {
        expect(mockUsers.some(u => u._id.equals(comment.userId))).toBe(true);
        expect(mockLogos.some(l => l._id.equals(comment.logoId))).toBe(true);
        expect(comment.content).toBeDefined();
        expect(comment.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('seedCollections', () => {
    it('should generate the specified number of collections per user', async () => {
      const collectionsPerUser = 2;
      const collections = await seedCollections({ 
        users: mockUsers, 
        logos: mockLogos,
        collectionsPerUser
      });

      expect(collections).toHaveLength(mockUsers.length * collectionsPerUser);
    });

    it('should generate collections with valid references', async () => {
      const collections = await seedCollections({ 
        users: mockUsers, 
        logos: mockLogos 
      });

      collections.forEach(collection => {
        expect(mockUsers.some(u => u._id.equals(collection.userId))).toBe(true);
        collection.logos.forEach(logoId => {
          expect(mockLogos.some(l => l._id.equals(logoId))).toBe(true);
        });
        expect(collection.name).toBeDefined();
        expect(collection.description).toBeDefined();
        expect(typeof collection.isPublic).toBe('boolean');
      });
    });
  });

  describe('seedFavorites', () => {
    it('should generate the specified number of favorites per user', async () => {
      const favoritesPerUser = 2;
      const favorites = await seedFavorites({ 
        users: mockUsers, 
        logos: mockLogos,
        favoritesPerUser
      });

      expect(favorites).toHaveLength(mockUsers.length * favoritesPerUser);
    });

    it('should generate favorites with valid references', async () => {
      const favorites = await seedFavorites({ 
        users: mockUsers, 
        logos: mockLogos 
      });

      favorites.forEach(favorite => {
        expect(mockUsers.some(u => u._id.equals(favorite.userId))).toBe(true);
        expect(mockLogos.some(l => l._id.equals(favorite.logoId))).toBe(true);
        expect(favorite.createdAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('seedRelationships', () => {
    it('should generate all relationship types', async () => {
      const relationships = await seedRelationships({
        users: mockUsers,
        logos: mockLogos,
        commentsPerLogo: 2,
        collectionsPerUser: 1,
        favoritesPerUser: 2
      });

      expect(relationships.comments).toBeDefined();
      expect(relationships.collections).toBeDefined();
      expect(relationships.favorites).toBeDefined();

      expect(relationships.comments.length).toBeGreaterThan(0);
      expect(relationships.collections.length).toBeGreaterThan(0);
      expect(relationships.favorites.length).toBeGreaterThan(0);
    });
  });
}); 
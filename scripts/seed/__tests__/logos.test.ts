import { ObjectId } from 'mongodb';
import { seedLogos, createTestLogo } from '../logos';

describe('Logo Seeding', () => {
  const mockUserIds = [new ObjectId(), new ObjectId(), new ObjectId()];

  describe('seedLogos', () => {
    it('should generate the specified number of logos', async () => {
      const logos = await seedLogos({ count: 5, userIds: mockUserIds });
      expect(logos).toHaveLength(5);
    });

    it('should distribute logos among users correctly', async () => {
      const perUser = 2;
      const logos = await seedLogos({ 
        count: 6, 
        userIds: mockUserIds,
        perUser 
      });
      
      // First two logos should belong to first user
      expect(logos[0].userId).toEqual(mockUserIds[0]);
      expect(logos[1].userId).toEqual(mockUserIds[0]);
      
      // Next two logos should belong to second user
      expect(logos[2].userId).toEqual(mockUserIds[1]);
      expect(logos[3].userId).toEqual(mockUserIds[1]);
    });

    it('should generate logos with ratings when specified', async () => {
      const logos = await seedLogos({ 
        count: 3, 
        userIds: mockUserIds,
        withRatings: true,
        minVotes: 2,
        maxVotes: 3
      });

      logos.forEach(logo => {
        expect(logo.votes.length).toBeGreaterThanOrEqual(2);
        expect(logo.votes.length).toBeLessThanOrEqual(3);
        expect(logo.averageRating).toBeGreaterThanOrEqual(0);
        expect(logo.averageRating).toBeLessThanOrEqual(5);
      });
    });

    it('should generate logos with valid tags', async () => {
      const logos = await seedLogos({ count: 3, userIds: mockUserIds });
      
      logos.forEach(logo => {
        expect(Array.isArray(logo.tags)).toBe(true);
        expect(logo.tags.length).toBeGreaterThan(0);
        logo.tags.forEach(tag => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('createTestLogo', () => {
    it('should create a logo with default values', async () => {
      const userId = new ObjectId();
      const logo = await createTestLogo(userId);
      
      expect(logo._id).toBeDefined();
      expect(logo.userId).toEqual(userId);
      expect(logo.name).toBeDefined();
      expect(logo.description).toBeDefined();
      expect(Array.isArray(logo.tags)).toBe(true);
    });

    it('should override default values with provided ones', async () => {
      const userId = new ObjectId();
      const customName = 'Custom Logo Name';
      const customTags = ['custom', 'tags'];
      
      const logo = await createTestLogo(userId, {
        name: customName,
        tags: customTags
      });

      expect(logo.name).toBe(customName);
      expect(logo.tags).toEqual(customTags);
    });
  });
}); 
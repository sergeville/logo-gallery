import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import { searchLogos, getPopularTags } from '../search-operations';
import { uploadLogo } from '../logo-operations';
import { registerUser } from '../auth';

interface TestLogo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  userId: string;
  url: string;
}

let mongoServer: MongoMemoryServer;

describe('[P1] Search and Filter Operations', () => {
  let testUserId: string;
  const testLogos: TestLogo[] = [];

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test',
      },
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Create a test user
    const user = await registerUser({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
    });
    testUserId = user.user!._id;

    // Upload test logos
    const logoData = [
      {
        title: 'Company Logo Design',
        description: 'Modern corporate logo',
        tags: ['corporate', 'modern', 'minimalist'],
        file: Buffer.from('mock-logo-1'),
      },
      {
        title: 'Vintage Badge',
        description: 'Retro style badge design',
        tags: ['vintage', 'badge', 'retro'],
        file: Buffer.from('mock-logo-2'),
      },
      {
        title: 'Tech Startup Logo',
        description: 'Modern tech company logo',
        tags: ['tech', 'modern', 'startup'],
        file: Buffer.from('mock-logo-3'),
      },
    ];

    for (const data of logoData) {
      const result = await uploadLogo(testUserId, data);
      if (result.logo) {
        testLogos.push(result.logo as TestLogo);
      }
    }
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await connectToDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('Basic Search', () => {
    it('should find logos by title keyword', async () => {
      const result = await searchLogos({ query: 'Company' });

      expect(result.status).toBe(200);
      expect(result.logos).toBeDefined();
      expect(result.logos).toHaveLength(1);
      expect(result.logos[0].title).toContain('Company');
    });

    it('should find logos by tag', async () => {
      const result = await searchLogos({ tags: ['modern'] });

      expect(result.status).toBe(200);
      expect(result.logos).toBeDefined();
      expect(result.logos).toHaveLength(2);
      expect(result.logos.every(logo => logo.tags.includes('modern'))).toBe(true);
    });

    it('should return empty array when no matches found', async () => {
      const result = await searchLogos({ query: 'nonexistent' });

      expect(result.status).toBe(200);
      expect(result.logos).toBeDefined();
      expect(result.logos).toHaveLength(0);
    });
  });

  describe('Advanced Filtering', () => {
    it('should filter by multiple tags', async () => {
      const result = await searchLogos({ tags: ['modern', 'tech'] });

      expect(result.status).toBe(200);
      expect(result.logos).toBeDefined();
      expect(result.logos).toHaveLength(1);
      expect(result.logos[0].tags).toContain('modern');
      expect(result.logos[0].tags).toContain('tech');
    });

    it('should sort results by date', async () => {
      const result = await searchLogos({ sort: 'date' });

      expect(result.status).toBe(200);
      expect(result.logos).toBeDefined();
      expect(new Date(result.logos[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(result.logos[1].createdAt).getTime()
      );
    });

    it('should handle pagination correctly', async () => {
      const pageSize = 2;
      const result = await searchLogos({ page: 1, limit: pageSize });

      expect(result.status).toBe(200);
      expect(result.logos).toBeDefined();
      expect(result.logos).toHaveLength(pageSize);
      expect(result.total).toBe(testLogos.length);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('Popular Tags', () => {
    it('should return most used tags', async () => {
      const result = await getPopularTags();

      expect(result.status).toBe(200);
      expect(result.tags).toBeDefined();
      expect(result.tags).toContainEqual({
        name: 'modern',
        count: 2,
      });
    });

    it('should respect the limit parameter', async () => {
      const limit = 2;
      const result = await getPopularTags(limit);

      expect(result.status).toBe(200);
      expect(result.tags).toBeDefined();
      expect(result.tags).toHaveLength(limit);
    });
  });
});

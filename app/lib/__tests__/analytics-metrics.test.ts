import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import {
  trackLogoView,
  getLogoViewStats,
  trackDownload,
  getDownloadStats,
  getUserEngagementMetrics,
  getPopularTags,
  getTopCreators,
  getDailyActivityStats,
} from '../analytics-operations';
import { uploadLogo } from '../logo-operations';
import { registerUser } from '../auth';
import { addComment, addVote } from '../interaction-operations';

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

describe('[P2] Analytics and Metrics', () => {
  let testUserId: string;
  let testLogo: TestLogo;
  let viewerUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'logo-gallery-test',
      },
    });
    process.env.MONGODB_URI = mongoServer.getUri();

    // Create test users
    const creator = await registerUser({
      email: 'creator@example.com',
      password: 'Password123!',
      username: 'creator',
    });
    testUserId = creator.user!._id;

    const viewer = await registerUser({
      email: 'viewer@example.com',
      password: 'Password123!',
      username: 'viewer',
    });
    viewerUserId = viewer.user!._id;

    // Upload test logo
    const result = await uploadLogo(testUserId, {
      title: 'Analytics Test Logo',
      description: 'A logo for testing analytics',
      tags: ['test', 'analytics'],
      file: Buffer.from('mock-logo-data'),
    });
    testLogo = result.logo as TestLogo;
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

  describe('View Tracking', () => {
    it('should track logo views', async () => {
      const result = await trackLogoView(testLogo._id, viewerUserId);

      expect(result.status).toBe(200);
      expect(result.view).toBeDefined();
      expect(result.view.logoId).toBe(testLogo._id);
      expect(result.view.userId).toBe(viewerUserId);
      expect(result.view.timestamp).toBeDefined();
    });

    it('should get logo view statistics', async () => {
      // Add multiple views
      await trackLogoView(testLogo._id, viewerUserId);
      await trackLogoView(testLogo._id, testUserId);

      const result = await getLogoViewStats(testLogo._id);

      expect(result.status).toBe(200);
      expect(result.totalViews).toBeGreaterThanOrEqual(2);
      expect(result.uniqueViewers).toBeGreaterThanOrEqual(2);
      expect(result.viewsByDate).toBeDefined();
    });
  });

  describe('Download Analytics', () => {
    it('should track logo downloads', async () => {
      const result = await trackDownload(testLogo._id, viewerUserId);

      expect(result.status).toBe(200);
      expect(result.download).toBeDefined();
      expect(result.download.logoId).toBe(testLogo._id);
      expect(result.download.userId).toBe(viewerUserId);
    });

    it('should get download statistics', async () => {
      // Add another download
      await trackDownload(testLogo._id, testUserId);

      const result = await getDownloadStats(testLogo._id);

      expect(result.status).toBe(200);
      expect(result.totalDownloads).toBeGreaterThanOrEqual(2);
      expect(result.uniqueDownloaders).toBeGreaterThanOrEqual(2);
      expect(result.downloadsByDate).toBeDefined();
    });
  });

  describe('User Engagement', () => {
    it('should get user engagement metrics', async () => {
      // Create some engagement data
      await addComment(testLogo._id, viewerUserId, { content: 'Test comment' });
      await addVote(testLogo._id, viewerUserId);

      const result = await getUserEngagementMetrics(viewerUserId);

      expect(result.status).toBe(200);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalComments).toBeGreaterThanOrEqual(1);
      expect(result.metrics.totalVotes).toBeGreaterThanOrEqual(1);
      expect(result.metrics.lastActive).toBeDefined();
    });

    it('should get popular tags', async () => {
      const result = await getPopularTags({
        timeframe: '7d',
        limit: 5,
      });

      expect(result.status).toBe(200);
      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags.length).toBeLessThanOrEqual(5);
    });

    it('should get top creators', async () => {
      const result = await getTopCreators({
        timeframe: '30d',
        limit: 10,
      });

      expect(result.status).toBe(200);
      expect(result.creators).toBeDefined();
      expect(Array.isArray(result.creators)).toBe(true);
      expect(result.creators.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Activity Statistics', () => {
    it('should get daily activity statistics', async () => {
      const result = await getDailyActivityStats();

      expect(result.status).toBe(200);
      expect(result.stats).toBeDefined();
      expect(result.stats.uploads).toBeDefined();
      expect(result.stats.comments).toBeDefined();
      expect(result.stats.votes).toBeDefined();
      expect(result.stats.downloads).toBeDefined();
      expect(result.stats.date).toBeDefined();
    });
  });
});

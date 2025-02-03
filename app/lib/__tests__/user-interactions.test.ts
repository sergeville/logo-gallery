import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, closeDatabase } from '../db-config';
import {
  addComment,
  updateComment,
  deleteComment,
  getComments,
  addVote,
  removeVote,
  getVotes,
  shareLogoByEmail,
  generateShareLink,
  getSharedLogoAccess,
} from '../interaction-operations';
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

interface TestComment {
  _id: string;
  logoId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

let mongoServer: MongoMemoryServer;

describe('[P1] User Interactions', () => {
  let testUserId: string;
  let testLogo: TestLogo;
  let testComment: TestComment;

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

    // Upload test logo
    const result = await uploadLogo(testUserId, {
      title: 'Test Logo',
      description: 'A test logo',
      tags: ['test'],
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

  describe('Comments', () => {
    it('should add a comment to a logo', async () => {
      const result = await addComment(testLogo._id, testUserId, {
        content: 'Great design!',
      });

      expect(result.status).toBe(200);
      expect(result.comment).toBeDefined();
      expect(result.comment.content).toBe('Great design!');
      expect(result.comment.userId).toBe(testUserId);

      testComment = result.comment;
    });

    it('should update an existing comment', async () => {
      const result = await updateComment(testComment._id, testUserId, {
        content: 'Updated: Amazing design!',
      });

      expect(result.status).toBe(200);
      expect(result.comment.content).toBe('Updated: Amazing design!');
      expect(result.comment.updatedAt).toBeDefined();
    });

    it('should prevent unauthorized comment updates', async () => {
      // Create another user
      const otherUser = await registerUser({
        email: 'other@example.com',
        password: 'Password123!',
        username: 'otheruser',
      });

      const result = await updateComment(testComment._id, otherUser.user!._id, {
        content: 'Should fail',
      });

      expect(result.status).toBe(403);
      expect(result.error).toBe('Unauthorized to modify this comment');
    });

    it('should delete a comment', async () => {
      const result = await deleteComment(testComment._id, testUserId);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should get comments for a logo', async () => {
      // Add a few comments first
      await addComment(testLogo._id, testUserId, { content: 'First comment' });
      await addComment(testLogo._id, testUserId, { content: 'Second comment' });

      const result = await getComments(testLogo._id);

      expect(result.status).toBe(200);
      expect(result.comments).toBeDefined();
      expect(result.comments).toHaveLength(2);
      expect(result.comments[0].content).toBe('Second comment'); // Most recent first
    });
  });

  describe('Votes', () => {
    it('should add a vote to a logo', async () => {
      const result = await addVote(testLogo._id, testUserId);

      expect(result.status).toBe(200);
      expect(result.vote).toBeDefined();
      expect(result.vote.userId).toBe(testUserId);
      expect(result.vote.logoId).toBe(testLogo._id);
    });

    it('should prevent duplicate votes', async () => {
      const result = await addVote(testLogo._id, testUserId);

      expect(result.status).toBe(400);
      expect(result.error).toBe('User has already voted for this logo');
    });

    it('should remove a vote from a logo', async () => {
      const result = await removeVote(testLogo._id, testUserId);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should get votes for a logo', async () => {
      // Add votes from different users
      await addVote(testLogo._id, testUserId);
      const otherUser = await registerUser({
        email: 'voter@example.com',
        password: 'Password123!',
        username: 'voter',
      });
      await addVote(testLogo._id, otherUser.user!._id);

      const result = await getVotes(testLogo._id);

      expect(result.status).toBe(200);
      expect(result.votes).toBeDefined();
      expect(result.votes).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('Sharing', () => {
    it('should generate a shareable link', async () => {
      const result = await generateShareLink(testLogo._id, testUserId, {
        expiresIn: '24h',
        allowDownload: true,
      });

      expect(result.status).toBe(200);
      expect(result.shareLink).toBeDefined();
      expect(result.shareLink).toMatch(/^http/);
      expect(result.expiresAt).toBeDefined();
    });

    it('should share logo by email', async () => {
      const result = await shareLogoByEmail(testLogo._id, testUserId, {
        email: 'recipient@example.com',
        message: 'Check out this logo!',
        allowDownload: true,
      });

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.shareId).toBeDefined();
    });

    it('should validate shared logo access', async () => {
      const shareResult = await generateShareLink(testLogo._id, testUserId, {
        expiresIn: '24h',
        allowDownload: true,
      });

      const result = await getSharedLogoAccess(shareResult.shareId);

      expect(result.status).toBe(200);
      expect(result.logo).toBeDefined();
      expect(result.allowDownload).toBe(true);
      expect(result.isExpired).toBe(false);
    });

    it('should handle expired share links', async () => {
      const shareResult = await generateShareLink(testLogo._id, testUserId, {
        expiresIn: '0s', // Expire immediately
      });

      const result = await getSharedLogoAccess(shareResult.shareId);

      expect(result.status).toBe(403);
      expect(result.error).toBe('Share link has expired');
    });
  });
});

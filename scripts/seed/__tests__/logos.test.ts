import { ObjectId } from 'mongodb';
import { seedLogos, createTestLogo } from '../logos';
import { Logo } from '@/app/types';

describe('Logo Seeding', () => {
  it('creates the specified number of logos', async () => {
    const userId = new ObjectId();
    const logos = await seedLogos({ 
      count: 3,
      userIds: [userId]
    });

    expect(logos).toHaveLength(3);
    logos.forEach(logo => {
      expect(logo._id).toBeInstanceOf(ObjectId);
      expect(logo.url).toMatch(/^https:\/\/example\.com\/logos\//);
      expect(logo.description).toBeTruthy();
      expect(logo.ownerId).toBeInstanceOf(ObjectId);
      expect(Array.isArray(logo.tags)).toBe(true);
      expect(logo.totalVotes).toBe(0);
      expect(logo.createdAt).toBeInstanceOf(Date);
    });
  });

  it('assigns logos to specified users', async () => {
    const userIds = [new ObjectId(), new ObjectId()];
    const logos = await seedLogos({ 
      count: 4,
      userIds
    });

    expect(logos).toHaveLength(4);
    logos.forEach(logo => {
      expect(userIds).toContainEqual(logo.ownerId);
    });
  });

  it('creates a test logo with custom data', async () => {
    const userId = new ObjectId();
    const customData = {
      description: 'Custom Logo',
      url: 'https://example.com/custom-logo.png',
      tags: ['custom', 'test']
    };

    const logo = await createTestLogo(userId, customData);

    expect(logo._id).toBeInstanceOf(ObjectId);
    expect(logo.description).toBe(customData.description);
    expect(logo.url).toBe(customData.url);
    expect(logo.tags).toEqual(customData.tags);
    expect(logo.ownerId).toBeInstanceOf(ObjectId);
    expect(logo.totalVotes).toBe(0);
  });
}); 
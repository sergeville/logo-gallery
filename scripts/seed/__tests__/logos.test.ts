import { ObjectId } from 'mongodb';
import { seedLogos, createTestLogo } from '@/scripts/seed/logos';
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
      expect(logo._id).toBeDefined();
      expect(typeof logo._id.toString()).toBe('string');
      expect(logo.url).toMatch(/^https:\/\/example\.com\/logos\//);
      expect(logo.description).toBeTruthy();
      expect(logo.userId).toBeDefined();
      expect(typeof logo.userId.toString()).toBe('string');
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
      expect(userIds.map(id => id.toString())).toContain(logo.userId.toString());
    });
  });

  it('creates a test logo with custom data', async () => {
    const userId = new ObjectId();
    const customData = {
      description: 'Custom Logo',
      url: 'https://example.com/custom-logo.png',
      name: 'Custom Test Logo'
    };

    const logo = await createTestLogo(userId, customData);

    expect(logo._id).toBeDefined();
    expect(typeof logo._id.toString()).toBe('string');
    expect(logo.description).toBe(customData.description);
    expect(logo.url).toBe(customData.url);
    expect(logo.name).toBe(customData.name);
    expect(logo.userId).toBeDefined();
    expect(typeof logo.userId.toString()).toBe('string');
  });
}); 
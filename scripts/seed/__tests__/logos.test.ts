import { Logo } from '@/app/lib/models/logo';
import { User } from '@/app/lib/models/user';
import { generateTestLogos } from '../logos';
import { generateTestUsers } from '../users';
import { Types } from 'mongoose';

describe('Logo Generator', () => {
  it('generates logos with required fields', async () => {
    const users = await generateTestUsers(1);
    const userIds = users.map(user => user._id);
    const logos = await generateTestLogos(1, userIds);
    const logo = logos[0];

    expect(logo._id).toBeDefined();
    expect(logo.title).toBeDefined();
    expect(typeof logo.title).toBe('string');
    expect(logo.description).toBeDefined();
    expect(typeof logo.description).toBe('string');
    expect(logo.imageUrl).toBeDefined();
    expect(typeof logo.imageUrl).toBe('string');
    expect(logo.thumbnailUrl).toBeDefined();
    expect(typeof logo.thumbnailUrl).toBe('string');
    expect(logo.userId).toBeDefined();
    expect(Types.ObjectId.isValid(logo.userId)).toBe(true);
    expect(logo.createdAt).toBeDefined();
    expect(logo.createdAt instanceof Date).toBe(true);
  });

  it('generates multiple logos', async () => {
    const users = await generateTestUsers(2);
    const userIds = users.map(user => user._id);
    const count = 5;
    const logos = await generateTestLogos(count, userIds);

    expect(logos).toHaveLength(count);
    logos.forEach(logo => {
      expect(logo._id).toBeDefined();
      expect(logo.title).toBeDefined();
      expect(logo.description).toBeDefined();
      expect(logo.imageUrl).toBeDefined();
      expect(logo.thumbnailUrl).toBeDefined();
      expect(userIds.map(id => id.toString())).toContain(logo.userId.toString());
    });
  });

  it('accepts custom data', async () => {
    const users = await generateTestUsers(1);
    const userId = users[0]._id;
    const customData = {
      title: 'Custom Logo',
      description: 'A custom description',
      imageUrl: 'custom-image.jpg',
      thumbnailUrl: 'custom-thumbnail.jpg'
    };

    const logos = await generateTestLogos(1, [userId], customData);
    const logo = logos[0];

    expect(logo.title).toBe(customData.title);
    expect(logo.description).toBe(customData.description);
    expect(logo.imageUrl).toBe(customData.imageUrl);
    expect(logo.thumbnailUrl).toBe(customData.thumbnailUrl);
    expect(logo.userId).toBeDefined();
    expect(Types.ObjectId.isValid(logo.userId)).toBe(true);
  });
}); 
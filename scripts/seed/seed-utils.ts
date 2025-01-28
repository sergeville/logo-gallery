import { ObjectId } from 'mongodb';
import { ILogo } from '../test-data/utils/logo-generator';

export function generateMockLogo(userId: ObjectId, index: number): ILogo {
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

  const logo: ILogo = {
    _id: new ObjectId(),
    name: `Test Logo ${index}`,
    description: `Description for test logo ${index}`,
    url: `/uploads/test-logo-${index}.png`,
    imageUrl: `/uploads/test-logo-${index}.png`,
    thumbnailUrl: `/uploads/test-logo-${index}-thumb.png`,
    userId,
    ownerName: 'Test User',
    category: 'Test',
    tags: ['test', `tag-${index}`],
    dimensions: { width: 800, height: 600 },
    fileSize: 256 * 1024,
    fileType: 'png',
    createdAt,
    updatedAt: createdAt
  };

  return logo;
}

export function generateMockLogos(userId: ObjectId, count: number): ILogo[] {
  return Array.from({ length: count }, (_, i) => generateMockLogo(userId, i + 1));
} 
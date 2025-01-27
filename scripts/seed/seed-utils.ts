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
    votes: [],
    totalVotes: 0,
    createdAt,
    updatedAt: createdAt
  };

  // Generate random votes
  const numVotes = Math.floor(Math.random() * 10);
  const votes = Array.from({ length: numVotes }, () => ({
    userId: new ObjectId(),
    rating: Math.floor(Math.random() * 5) + 1,
    timestamp: new Date(createdAt.getTime() + Math.random() * 86400000)
  }));

  logo.votes = votes;
  logo.totalVotes = votes.length;

  return logo;
}

export function generateMockLogos(userId: ObjectId, count: number): ILogo[] {
  return Array.from({ length: count }, (_, i) => generateMockLogo(userId, i + 1));
}

export function createLogo(userId: ObjectId, index: number): ILogo {
  return {
    _id: new ObjectId(),
    name: `Test Logo ${index}`,
    description: `Description for test logo ${index}`,
    imageUrl: `https://example.com/logos/test-logo-${index}.png`,
    thumbnailUrl: `https://example.com/logos/test-logo-${index}-thumb.png`,
    url: `https://example.com/logos/test-logo-${index}.png`,
    userId,
    ownerName: 'Test User',
    category: 'Test',
    tags: ['test', `tag${index}`],
    dimensions: {
      width: 800,
      height: 600
    },
    fileSize: 256 * 1024,
    fileType: 'png',
    totalVotes: 0,
    votes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
} 
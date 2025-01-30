import { Logo } from '@/app/types';
import { ObjectId } from 'mongodb';

export const mockLogoBase: Partial<Logo> = {
  _id: new ObjectId('507f1f77bcf86cd799439011'),
  name: 'Test Logo',
  description: 'A test logo for unit testing',
  imageUrl: 'https://example.com/test-logo.png',
  thumbnailUrl: 'https://example.com/test-logo-thumb.png',
  userId: new ObjectId('507f1f77bcf86cd799439012'),
  tags: ['test', 'unit-testing'],
  category: 'Test',
  dimensions: { width: 800, height: 600 },
  fileSize: 1024 * 1024, // 1MB
  fileType: 'png',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  totalVotes: 0,
  votes: []
};

export const mockLogoWithResponsiveUrls: Partial<Logo> = {
  ...mockLogoBase,
  responsiveUrls: {
    sm: 'https://example.com/test-logo-sm.jpg',
    md: 'https://example.com/test-logo-md.jpg',
    lg: 'https://example.com/test-logo-lg.jpg',
    xl: 'https://example.com/test-logo-xl.jpg',
    '2xl': 'https://example.com/test-logo-2xl.jpg'
  }
};

export const mockLogoWithVotes: Partial<Logo> = {
  ...mockLogoBase,
  totalVotes: 42,
  votes: Array.from({ length: 42 }, (_, i) => ({
    userId: new ObjectId(`507f1f77bcf86cd7994390${i.toString().padStart(2, '0')}`),
    timestamp: new Date('2024-01-01T00:00:00.000Z')
  }))
};

export const mockLogoWithError: Partial<Logo> = {
  ...mockLogoBase,
  imageUrl: 'error.jpg',
  thumbnailUrl: 'error.jpg'
};

export const generateMockLogo = (overrides: Partial<Logo> = {}): Partial<Logo> => ({
  ...mockLogoBase,
  ...overrides,
  _id: overrides._id || new ObjectId(),
  userId: overrides.userId || new ObjectId()
}); 
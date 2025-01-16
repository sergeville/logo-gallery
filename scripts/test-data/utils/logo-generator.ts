import { ObjectId } from 'mongodb';

export interface ILogo {
  _id: ObjectId;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: ObjectId;
  ownerName: string;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  url: string;
  totalVotes: number;
  votes: any[];
  createdAt: Date;
  updatedAt: Date;
}

export function generateSpecificLogos(ownerId: ObjectId): ILogo[] {
  return [
    {
      _id: new ObjectId(),
      name: 'Tech Company Logo',
      description: 'Modern logo for a technology company',
      imageUrl: 'https://example.com/logos/tech-company.png',
      thumbnailUrl: 'https://example.com/logos/tech-company-thumb.png',
      userId: ownerId,
      ownerName: 'Test User',
      category: 'Technology',
      tags: ['tech', 'modern', 'professional'],
      dimensions: {
        width: 1024,
        height: 1024
      },
      fileSize: 256 * 1024,
      fileType: 'png',
      url: 'https://example.com/logos/tech-company.png',
      totalVotes: 0,
      votes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Creative Agency Logo',
      description: 'Artistic logo for a creative agency',
      imageUrl: 'https://example.com/logos/creative-agency.png',
      thumbnailUrl: 'https://example.com/logos/creative-agency-thumb.png',
      userId: ownerId,
      ownerName: 'Test User',
      category: 'Creative',
      tags: ['creative', 'artistic', 'colorful'],
      dimensions: {
        width: 800,
        height: 600
      },
      fileSize: 192 * 1024,
      fileType: 'png',
      url: 'https://example.com/logos/creative-agency.png',
      totalVotes: 0,
      votes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

export function generateLogos(ownerIds: ObjectId[], count: number): ILogo[] {
  const categories = ['Technology', 'Creative', 'Business', 'Education', 'Entertainment'];
  const fileTypes = ['png', 'svg', 'jpg'];
  const dimensions = [
    { width: 800, height: 600 },
    { width: 1024, height: 1024 },
    { width: 1200, height: 900 }
  ];

  return Array.from({ length: count }, (_, index) => {
    const randomOwner = ownerIds[Math.floor(Math.random() * ownerIds.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomFileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const randomDimensions = dimensions[Math.floor(Math.random() * dimensions.length)];

    return {
      _id: new ObjectId(),
      name: `Test Logo ${index + 1}`,
      description: `Description for test logo ${index + 1}`,
      imageUrl: `https://example.com/logos/test-logo-${index + 1}.${randomFileType}`,
      thumbnailUrl: `https://example.com/logos/test-logo-${index + 1}-thumb.${randomFileType}`,
      userId: randomOwner,
      ownerName: 'Test User',
      category: randomCategory,
      tags: ['test', `tag${index + 1}`, randomCategory.toLowerCase()],
      dimensions: randomDimensions,
      fileSize: Math.floor(Math.random() * 500 * 1024),
      fileType: randomFileType,
      url: `https://example.com/logos/test-logo-${index + 1}.${randomFileType}`,
      totalVotes: 0,
      votes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
} 
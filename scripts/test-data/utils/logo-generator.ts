import { ObjectId } from 'mongodb';

export interface ILogo {
  _id: ObjectId;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  ownerId: ObjectId;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  metadata: {
    version: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  colors?: string[];
}

export function generateSpecificLogos(ownerId: ObjectId): ILogo[] {
  return [
    {
      _id: new ObjectId(),
      name: 'Tech Company Logo',
      description: 'Modern logo for a technology company',
      imageUrl: 'https://example.com/logos/tech-company.png',
      thumbnailUrl: 'https://example.com/logos/tech-company-thumb.png',
      ownerId,
      category: 'Technology',
      tags: ['tech', 'modern', 'professional'],
      dimensions: {
        width: 1024,
        height: 1024
      },
      fileSize: 256 * 1024, // 256KB
      fileType: 'png',
      metadata: {
        version: '1.0.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      colors: ['#1E90FF', '#000000', '#FFFFFF']
    },
    {
      _id: new ObjectId(),
      name: 'Creative Agency Logo',
      description: 'Artistic logo for a creative agency',
      imageUrl: 'https://example.com/logos/creative-agency.png',
      thumbnailUrl: 'https://example.com/logos/creative-agency-thumb.png',
      ownerId,
      category: 'Creative',
      tags: ['creative', 'artistic', 'colorful'],
      dimensions: {
        width: 800,
        height: 600
      },
      fileSize: 192 * 1024, // 192KB
      fileType: 'png',
      metadata: {
        version: '1.0.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      colors: ['#FF4500', '#FFD700', '#000000']
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
      ownerId: randomOwner,
      category: randomCategory,
      tags: ['test', `tag${index + 1}`, randomCategory.toLowerCase()],
      dimensions: randomDimensions,
      fileSize: Math.floor(Math.random() * 500 * 1024), // Random size up to 500KB
      fileType: randomFileType,
      metadata: {
        version: '1.0.0',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      colors: [
        `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
      ]
    };
  });
} 
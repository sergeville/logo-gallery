import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { ILogo, ILogoDimensions } from '../../../src/lib/models/Logo';

const LOGO_CATEGORIES = [
  'Technology',
  'Business',
  'Creative',
  'Education',
  'Entertainment',
  'Food & Beverage',
  'Health',
  'Sports',
];

const LOGO_TAGS = [
  'minimal',
  'modern',
  'colorful',
  'abstract',
  'geometric',
  'vintage',
  'professional',
  'playful',
  'elegant',
  'bold',
];

const FILE_TYPES = ['png', 'svg', 'jpg'];

export function generateLogoDimensions(): ILogoDimensions {
  return {
    width: faker.number.int({ min: 500, max: 2000 }),
    height: faker.number.int({ min: 500, max: 2000 }),
  };
}

export function generateLogo(ownerId: ObjectId, overrides: Partial<ILogo> = {}): ILogo {
  const dimensions = generateLogoDimensions();
  const fileType = faker.helpers.arrayElement(FILE_TYPES);
  
  return {
    _id: new ObjectId(),
    name: faker.company.name() + ' Logo',
    description: faker.lorem.paragraph(),
    imageUrl: faker.image.url(),
    thumbnailUrl: faker.image.url(),
    ownerId,
    ownerName: faker.person.fullName(),
    tags: faker.helpers.arrayElements(LOGO_TAGS, { min: 2, max: 5 }),
    category: faker.helpers.arrayElement(LOGO_CATEGORIES),
    dimensions,
    fileSize: faker.number.int({ min: 50000, max: 5000000 }),
    fileType,
    averageRating: 0,
    totalVotes: 0,
    votes: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  } as ILogo;
}

export function generateLogos(ownerIds: ObjectId[], count: number): ILogo[] {
  return Array.from({ length: count }, () => {
    const ownerId = faker.helpers.arrayElement(ownerIds);
    return generateLogo(ownerId);
  });
}

// Generate specific logos for consistent test data
export function generateSpecificLogos(ownerId: ObjectId): ILogo[] {
  return [
    generateLogo(ownerId, {
      name: 'TechCorp Logo',
      category: 'Technology',
      tags: ['minimal', 'modern', 'professional'],
      description: 'A modern, minimalist logo for a technology company',
    }),
    generateLogo(ownerId, {
      name: 'Creative Studio Logo',
      category: 'Creative',
      tags: ['colorful', 'playful', 'abstract'],
      description: 'A vibrant and creative logo for a design studio',
    }),
    generateLogo(ownerId, {
      name: 'Business Solutions Logo',
      category: 'Business',
      tags: ['professional', 'elegant', 'minimal'],
      description: 'A professional and elegant logo for a business consultancy',
    }),
  ];
} 
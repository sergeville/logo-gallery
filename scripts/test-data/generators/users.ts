import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import { IUser, IUserProfile } from '../../../src/lib/models/User';

const COMPANIES = [
  'TechCorp',
  'DesignHub',
  'Creative Solutions',
  'Digital Dynamics',
  'Brand Masters',
];

const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'London, UK',
  'Toronto, CA',
  'Berlin, DE',
];

export function generateUserProfile(): IUserProfile {
  return {
    bio: faker.lorem.paragraph(),
    avatarUrl: faker.image.avatar(),
    website: faker.internet.url(),
    location: faker.helpers.arrayElement(LOCATIONS),
    company: faker.helpers.arrayElement(COMPANIES),
  };
}

export function generateUser(overrides: Partial<IUser> = {}): IUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.userName({ firstName, lastName });

  return {
    _id: new ObjectId(),
    email: faker.internet.email({ firstName, lastName }),
    username,
    name: `${firstName} ${lastName}`,
    profile: generateUserProfile(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  } as IUser;
}

export function generateUsers(count: number): IUser[] {
  return Array.from({ length: count }, () => generateUser());
}

// Generate specific users for consistent test data
export function generateSpecificUsers(): IUser[] {
  return [
    generateUser({
      _id: new ObjectId(),
      email: 'admin@logogallery.com',
      username: 'admin',
      name: 'Admin User',
      profile: {
        bio: 'Logo Gallery Administrator',
        company: 'Logo Gallery',
        location: 'San Francisco, CA',
      },
    }),
    generateUser({
      _id: new ObjectId(),
      email: 'designer@logogallery.com',
      username: 'designer',
      name: 'Test Designer',
      profile: {
        bio: 'Professional Logo Designer',
        company: 'Design Studio',
        location: 'New York, NY',
      },
    }),
    generateUser({
      _id: new ObjectId(),
      email: 'tester@logogallery.com',
      username: 'tester',
      name: 'Test User',
      profile: {
        bio: 'Quality Assurance Engineer',
        company: 'QA Team',
        location: 'London, UK',
      },
    }),
  ];
} 
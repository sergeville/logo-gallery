import { ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

interface UserProfile {
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
}

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string; // Will be hashed
  profile: UserProfile;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

interface UserSeedOptions {
  count: number;
  withProfiles?: boolean;
  roles?: Array<'user' | 'admin'>;
  passwordHash?: string;
}

const DEFAULT_PASSWORD = 'Test123!@#';
const SALT_ROUNDS = 10;

/**
 * Generates a random user profile
 */
function generateProfile(): UserProfile {
  return {
    bio: `Test user bio ${Math.random().toString(36).substring(7)}`,
    location: ['New York', 'London', 'Tokyo', 'Paris', 'Berlin'][Math.floor(Math.random() * 5)],
    website: `https://example-${Math.random().toString(36).substring(7)}.com`,
    company: `Company ${Math.random().toString(36).substring(7)}`,
  };
}

/**
 * Generates a single user with optional profile
 */
async function generateUser(index: number, options: UserSeedOptions): Promise<User> {
  const username = `testuser${index}`;
  const email = `${username}@example.com`;
  const password = await hash(options.passwordHash || DEFAULT_PASSWORD, SALT_ROUNDS);
  
  return {
    _id: new ObjectId(),
    username,
    email,
    password,
    profile: options.withProfiles ? generateProfile() : {},
    role: options.roles ? options.roles[Math.floor(Math.random() * options.roles.length)] : 'user',
    createdAt: new Date(),
    lastLogin: new Date(),
    isActive: true,
  };
}

/**
 * Seeds users into the database
 */
export async function seedUsers(options: UserSeedOptions): Promise<User[]> {
  const users: User[] = [];
  
  for (let i = 0; i < options.count; i++) {
    const user = await generateUser(i, options);
    users.push(user);
  }
  
  return users;
}

/**
 * Seeds a specific number of admin users
 */
export async function seedAdmins(count: number): Promise<User[]> {
  return seedUsers({
    count,
    withProfiles: true,
    roles: ['admin'],
  });
}

/**
 * Creates a test user with specific attributes
 */
export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
  const defaultUser = await generateUser(0, { count: 1, withProfiles: true });
  return { ...defaultUser, ...overrides };
}

// Example usage:
// const users = await seedUsers({ count: 10, withProfiles: true, roles: ['user', 'admin'] });
// const admins = await seedAdmins(2);
// const testUser = await createTestUser({ email: 'custom@example.com' }); 
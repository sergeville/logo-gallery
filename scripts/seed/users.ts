import { ObjectId } from 'mongodb';
import { User } from '../../app/lib/types';

interface UserSeedOptions {
  count: number;
  withProfiles?: boolean;
  roles?: Array<'user' | 'admin'>;
}

/**
 * Generates a single user
 */
async function generateUser(index: number, options: UserSeedOptions): Promise<User> {
  const email = `testuser${index}@example.com`;
  
  return {
    _id: new ObjectId(),
    email,
    name: `Test User ${index}`,
    createdAt: new Date(),
    updatedAt: new Date()
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
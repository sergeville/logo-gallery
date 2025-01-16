import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId;
  email: string;
  username: string;
  name: string;
  profile: {
    website?: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
  };
  role: string;
  status: string;
  lastLogin: Date;
}

export function generateSpecificUsers(): IUser[] {
  return [
    {
      _id: new ObjectId(),
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      profile: {
        bio: 'System administrator',
        location: 'San Francisco'
      },
      role: 'admin',
      status: 'active',
      lastLogin: new Date()
    },
    {
      _id: new ObjectId(),
      email: 'moderator@example.com',
      username: 'moderator',
      name: 'Moderator User',
      profile: {
        bio: 'Content moderator',
        location: 'New York'
      },
      role: 'moderator',
      status: 'active',
      lastLogin: new Date()
    },
    {
      _id: new ObjectId(),
      email: 'designer@example.com',
      username: 'designer',
      name: 'Designer User',
      profile: {
        website: 'https://designer.example.com',
        bio: 'Professional logo designer',
        location: 'Los Angeles'
      },
      role: 'designer',
      status: 'active',
      lastLogin: new Date()
    }
  ];
}

export function generateUsers(count: number): IUser[] {
  return Array.from({ length: count }, (_, index) => ({
    _id: new ObjectId(),
    email: `user${index + 1}@example.com`,
    username: `user${index + 1}`,
    name: `Test User ${index + 1}`,
    profile: {
      bio: `Test user bio ${index + 1}`,
      location: 'Test City'
    },
    role: 'user',
    status: 'active',
    lastLogin: new Date()
  }));
} 
import { jest } from '@jest/globals';
import { Model } from 'mongoose';
import { IUser } from '../user';

const comparePassword = jest.fn().mockImplementation(async (candidatePassword: string) => {
  return true;
});

// Create the mock model
const MockUserModel = {
  comparePassword,
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([]),
  exec: jest.fn().mockResolvedValue(null),
  prototype: {
    comparePassword,
  },
} as unknown as Model<IUser>;

// Export the mock model and its methods for testing
export const User = MockUserModel;
export default User; 
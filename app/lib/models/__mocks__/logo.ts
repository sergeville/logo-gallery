import { jest } from '@jest/globals';
import { Document, Model } from 'mongoose';
import { ILogo, ILogoModel } from '../logo';

// Create mock functions for static methods
const findByUserId = jest.fn().mockImplementation((userId: string) => {
  return Promise.resolve([]);
});

const searchByTitle = jest.fn().mockImplementation((query: string) => {
  return Promise.resolve([]);
});

const safeDelete = jest.fn().mockImplementation((id: string, userId: string) => {
  return Promise.resolve({ success: true });
});

// Create the mock model
const MockLogoModel = {
  findByUserId,
  searchByTitle,
  safeDelete,
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([]),
  exec: jest.fn().mockResolvedValue(null),
} as unknown as Model<ILogo> & ILogoModel;

// Export the mock model and its methods for testing
export const Logo = MockLogoModel;
export default Logo; 
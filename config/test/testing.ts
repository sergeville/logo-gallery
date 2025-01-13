import path from 'path';

export const testingConfig = {
  cleanupAfterEach: true,
  seedDataPath: path.join(process.cwd(), 'test', 'seed-data'),
  defaultTimeout: 5000,
  mockStorage: true
}; 
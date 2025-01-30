export const mockDb = {
  collection: jest.fn().mockReturnThis(),
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  aggregate: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]),
};

export const connectToDatabase = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    db: mockDb,
    client: {
      close: jest.fn().mockResolvedValue(true),
    },
  });
});

export const disconnectFromDatabase = jest.fn().mockImplementation(() => {
  return Promise.resolve(true);
});

// Helper function to reset all mocks
export const resetMocks = () => {
  Object.values(mockDb).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
  connectToDatabase.mockClear();
  disconnectFromDatabase.mockClear();
};

// Helper function to set mock return values
export const setMockDbResponse = (method: keyof typeof mockDb, value: any) => {
  const mockFn = mockDb[method];
  if (jest.isMockFunction(mockFn)) {
    if (method === 'find' || method === 'aggregate') {
      mockFn.mockReturnValue({
        ...mockDb,
        toArray: jest.fn().mockResolvedValue(value),
      });
    } else {
      mockFn.mockResolvedValue(value);
    }
  }
}; 
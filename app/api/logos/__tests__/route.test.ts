import { GET } from '@/app/api/logos/route';
import { connectToDatabase } from '@/app/lib/db';

jest.mock('@/app/lib/db');

describe('Logos API', () => {
  const mockLogos = [
    {
      _id: '1',
      name: 'Test Logo 1',
      url: 'https://example.com/logo1.png',
      description: 'Test description 1',
      ownerId: 'user1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: '2',
      name: 'Test Logo 2',
      url: 'https://example.com/logo2.png',
      description: 'Test description 2',
      ownerId: 'user2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (connectToDatabase as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockLogos)
            })
          })
        }),
        countDocuments: jest.fn().mockResolvedValue(mockLogos.length)
      })
    });
  });

  it('returns all logos with pagination', async () => {
    const request = new Request('http://localhost/api/logos?page=1&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      logos: mockLogos,
      pagination: {
        current: 1,
        total: Math.ceil(mockLogos.length / 10),
        hasMore: false
      }
    });
  });

  it('handles empty logo list', async () => {
    (connectToDatabase as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([])
            })
          })
        }),
        countDocuments: jest.fn().mockResolvedValue(0)
      })
    });

    const request = new Request('http://localhost/api/logos?page=1&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      logos: [],
      pagination: {
        current: 1,
        total: 0,
        hasMore: false
      }
    });
  });

  it('handles database errors', async () => {
    (connectToDatabase as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/logos?page=1&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: 'Failed to fetch logos'
    });
  });

  it('validates pagination parameters', async () => {
    const request = new Request('http://localhost/api/logos?page=0&limit=0');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      message: 'Invalid pagination parameters'
    });
  });
}); 
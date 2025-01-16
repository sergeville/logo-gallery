import { POST } from '../route';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/app/lib/db';

jest.mock('next-auth');
jest.mock('@/app/lib/db');

describe('Logo Vote API', () => {
  const mockLogo = {
    _id: '123',
    name: 'Test Logo',
    votes: [],
    averageRating: 0
  };

  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectToDatabase as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(mockLogo),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      })
    });
  });

  it('successfully votes for a logo', async () => {
    const request = new Request('http://localhost/api/logos/123/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 })
    });

    const response = await POST(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'Vote recorded successfully'
    });
  });

  it('validates rating value', async () => {
    const request = new Request('http://localhost/api/logos/123/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 6 })
    });

    const response = await POST(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  });

  it('requires authentication', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/logos/123/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 })
    });

    const response = await POST(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      success: false,
      message: 'Not authenticated'
    });
  });

  it('handles non-existent logo', async () => {
    (connectToDatabase as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
        updateOne: jest.fn()
      })
    });

    const request = new Request('http://localhost/api/logos/123/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 })
    });

    const response = await POST(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      message: 'Logo not found'
    });
  });

  it('handles database errors', async () => {
    (connectToDatabase as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/logos/123/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 4 })
    });

    const response = await POST(request, { params: { id: '123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: 'Failed to record vote'
    });
  });
}); 
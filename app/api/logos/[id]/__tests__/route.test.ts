import { ObjectId } from 'mongodb';
import { GET, DELETE } from '../route';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/app/lib/db';
import { unlink } from 'fs/promises';

jest.mock('next-auth');
jest.mock('@/app/lib/db');
jest.mock('fs/promises');

describe('Logo API', () => {
  const mockLogo = {
    _id: new ObjectId(),
    name: 'Test Logo',
    imageUrl: '/uploads/test-logo.png',
    ownerId: new ObjectId(),
  };

  const mockSession = {
    user: {
      id: mockLogo.ownerId.toString(),
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (connectToDatabase as jest.Mock).mockResolvedValue({
      db: {
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockLogo),
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        })
      }
    });
    (unlink as jest.Mock).mockResolvedValue(undefined);
  });

  describe('GET /api/logos/[id]', () => {
    it('returns logo when found', async () => {
      const request = new Request('http://localhost/api/logos/123');
      const response = await GET(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLogo);
    });

    it('returns 404 when logo not found', async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({
        db: {
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
          })
        }
      });

      const request = new Request('http://localhost/api/logos/123');
      const response = await GET(request, { params: { id: '123' } });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/logos/[id]', () => {
    it('deletes logo successfully', async () => {
      const request = new Request('http://localhost/api/logos/123', {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Logo deleted successfully' });
      expect(unlink).toHaveBeenCalled();
    });

    it('returns 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/logos/123', {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 when logo not found', async () => {
      (connectToDatabase as jest.Mock).mockResolvedValue({
        db: {
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
          })
        }
      });

      const request = new Request('http://localhost/api/logos/123', {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Logo not found' });
    });

    it('returns 403 when user is not the owner', async () => {
      const request = new Request('http://localhost/api/logos/123', {
        method: 'DELETE'
      });
      
      // Change the session user ID to be different from the logo owner
      (getServerSession as jest.Mock).mockResolvedValue({
        user: {
          id: new ObjectId().toString(),
          email: 'other@example.com'
        }
      });

      const response = await DELETE(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({ error: 'Unauthorized - You can only delete your own logos' });
    });

    it('handles file deletion error gracefully', async () => {
      (unlink as jest.Mock).mockRejectedValue(new Error('File deletion failed'));

      const request = new Request('http://localhost/api/logos/123', {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: { id: '123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Logo deleted successfully' });
    });
  });
}); 
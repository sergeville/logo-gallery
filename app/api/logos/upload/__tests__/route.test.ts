import { POST } from '../route';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');

describe('Logo Upload API', () => {
  const mockSession = {
    user: {
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('successfully uploads a logo', async () => {
    const formData = new FormData();
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    formData.append('file', file);

    const request = new Request('http://localhost/api/logos/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'File uploaded successfully'
    });
  });

  it('rejects unauthorized requests', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const formData = new FormData();
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    formData.append('file', file);

    const request = new Request('http://localhost/api/logos/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      success: false,
      message: 'Not authenticated'
    });
  });

  it('handles missing file', async () => {
    const formData = new FormData();

    const request = new Request('http://localhost/api/logos/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      message: 'No file provided'
    });
  });

  it('validates file type', async () => {
    const formData = new FormData();
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    formData.append('file', file);

    const request = new Request('http://localhost/api/logos/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      message: 'Invalid file type'
    });
  });

  it('handles file system errors', async () => {
    const formData = new FormData();
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    formData.append('file', file);

    // Mock FormData to throw an error
    const mockFormData = jest.fn().mockRejectedValue(new Error('File system error'));
    const request = new Request('http://localhost/api/logos/upload', {
      method: 'POST',
      body: formData
    });
    request.formData = mockFormData;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      message: 'Failed to upload file'
    });
  });
}); 
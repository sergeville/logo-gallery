import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

test.describe('Test Data Cleanup API', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!',
    username: `testuser_${Date.now()}`
  };

  const testLogo = {
    title: `Test Logo ${Date.now()}`,
    description: 'A test logo for cleanup testing',
    imageUrl: 'https://example.com/test.png'
  };

  test.beforeEach(async () => {
    // Create test data
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        username: testUser.username
      }
    });

    await prisma.logo.create({
      data: testLogo
    });
  });

  test('cleans up test data with POST request', async ({ request }) => {
    const response = await request.post('/api/test/cleanup');
    expect(response.ok()).toBeTruthy();
    
    // Verify response
    const json = await response.json();
    expect(json.message).toBe('Test data cleaned up successfully');

    // Verify data is cleaned up
    const user = await prisma.user.findUnique({
      where: { email: testUser.email }
    });
    expect(user).toBeNull();

    const logo = await prisma.logo.findFirst({
      where: { title: testLogo.title }
    });
    expect(logo).toBeNull();
  });

  test('returns 405 for non-POST requests', async ({ request }) => {
    // Test GET request
    const getResponse = await request.get('/api/test/cleanup');
    expect(getResponse.status()).toBe(405);

    // Test PUT request
    const putResponse = await request.put('/api/test/cleanup');
    expect(putResponse.status()).toBe(405);

    // Test DELETE request
    const deleteResponse = await request.delete('/api/test/cleanup');
    expect(deleteResponse.status()).toBe(405);

    // Test PATCH request
    const patchResponse = await request.patch('/api/test/cleanup');
    expect(patchResponse.status()).toBe(405);
  });

  test('returns 403 in production environment', async ({ request }) => {
    // Mock production environment
    process.env.NODE_ENV = 'production';
    
    const response = await request.post('/api/test/cleanup');
    expect(response.status()).toBe(403);
    
    const json = await response.json();
    expect(json.error).toBe('Not available in production');

    // Reset environment
    process.env.NODE_ENV = 'test';
  });

  test('handles database errors gracefully', async ({ request }) => {
    // Force a database error by closing the connection
    await prisma.$disconnect();
    
    const response = await request.post('/api/test/cleanup');
    expect(response.status()).toBe(500);
    
    const json = await response.json();
    expect(json.error).toBe('Failed to clean up test data');

    // Reconnect for other tests
    await prisma.$connect();
  });
}); 
import { GET } from '@/app/api/logos/route';
import { GET as getUserLogos } from '@/app/api/logos/user/[id]/route';
import Logo from '@/app/lib/models/logo';

describe('API Module Resolution Test', () => {
  it('should properly resolve API route imports', () => {
    // Test API route imports
    expect(typeof GET).toBe('function');
    expect(typeof getUserLogos).toBe('function');
  });

  it('should have Logo model with static methods', () => {
    // Test Logo model static methods
    expect(typeof Logo.findByUserId).toBe('function');
    expect(typeof Logo.searchByTitle).toBe('function');
    expect(typeof Logo.safeDelete).toBe('function');
  });

  it('should be able to call Logo model static methods', async () => {
    // Test calling static methods
    const mockUserId = 'test-user-id';
    const mockQuery = 'test-query';
    
    const userLogos = await Logo.findByUserId(mockUserId);
    expect(Array.isArray(userLogos)).toBe(true);
    
    const searchResults = await Logo.searchByTitle(mockQuery);
    expect(Array.isArray(searchResults)).toBe(true);
    
    const deleteResult = await Logo.safeDelete('test-id', mockUserId);
    expect(deleteResult).toEqual({ success: true });
  });
}); 
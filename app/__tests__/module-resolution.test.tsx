import React from 'react';
import { render } from '@testing-library/react';
import LogoCard from '@/app/components/LogoCard';
import { connectToDatabase } from '@/app/lib/db';

describe('Module Resolution Test', () => {
  it('should properly resolve imports from different paths', () => {
    // Test component import from @/components
    const mockLogo = {
      _id: '1',
      title: 'Test Logo',
      description: 'Test Description',
      imageUrl: '/test.png',
      thumbnailUrl: '/test-thumb.png',
      userId: 'user1',
      createdAt: new Date().toISOString(),
      responsiveUrls: {},
      totalVotes: 0,
      fileSize: 1024,
      optimizedSize: 512,
      compressionRatio: '50%'
    };

    const { container } = render(<LogoCard logo={mockLogo} />);
    expect(container).toBeTruthy();

    // Test lib import from @/lib
    expect(typeof connectToDatabase).toBe('function');
  });
}); 
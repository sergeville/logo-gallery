import { render, screen } from '@testing-library/react';
import LogoCard from '../LogoCard';

describe('LogoCard', () => {
  const mockProps = {
    name: 'Test Logo',
    imageUrl: '/test-image.jpg',
    uploadedAt: new Date('2024-01-01')
  };

  it('renders logo information correctly', () => {
    render(<LogoCard {...mockProps} />);

    expect(screen.getByText('Test Logo')).toBeInTheDocument();
    expect(screen.getByAltText('Test Logo')).toBeInTheDocument();
  });
}); 
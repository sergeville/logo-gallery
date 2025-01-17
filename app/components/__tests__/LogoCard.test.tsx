import { render, screen } from '@testing-library/react';
import LogoCard from '../LogoCard';

describe('LogoCard', () => {
  const mockProps = {
    name: 'Test Logo',
    imageUrl: '/test-image.jpg',
    uploadedAt: new Date('2024-01-01'),
    rating: 4.5,
    totalVotes: 10
  };

  it('renders logo information correctly', () => {
    render(<LogoCard {...mockProps} />);

    expect(screen.getByText('Test Logo')).toBeInTheDocument();
    expect(screen.getByText(/Rating: 4.5/)).toBeInTheDocument();
    expect(screen.getByText(/10 votes/)).toBeInTheDocument();
    expect(screen.getByAltText('Test Logo')).toBeInTheDocument();
  });
}); 
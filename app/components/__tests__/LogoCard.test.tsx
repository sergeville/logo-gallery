import { render, fireEvent } from '@testing-library/react'
import { LogoCard } from '../LogoCard'
import { ClientLogo } from '@/app/lib/types'

describe('LogoCard', () => {
  const mockOnVote = jest.fn()
  const mockLogo: ClientLogo = {
    id: '123456789012345678901234',
    name: 'Test Logo',
    description: 'Test Logo Description',
    url: 'https://example.com/logo.png',
    imageUrl: 'https://example.com/logo.png',
    thumbnailUrl: 'https://example.com/logo-thumb.png',
    userId: '123456789012345678901234',
    ownerName: 'Test User',
    tags: ['test'],
    totalVotes: 0,
    votes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders logo information', () => {
    const { getByText } = render(<LogoCard logo={mockLogo} onVote={mockOnVote} />)
    expect(getByText('Test Logo')).toBeInTheDocument()
    expect(getByText('Test Logo Description')).toBeInTheDocument()
    expect(getByText('0 votes')).toBeInTheDocument()
  })

  it('calls onVote when vote button is clicked', () => {
    const { getByText } = render(<LogoCard logo={mockLogo} onVote={mockOnVote} />)
    fireEvent.click(getByText('Vote'))
    expect(mockOnVote).toHaveBeenCalledWith(mockLogo.id)
  })
}) 
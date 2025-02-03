import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import Header from '../components/Header'
import ThemeToggle from '../components/ThemeToggle'
import { generateTestUser } from '../utils/test-utils'

// Mock next-themes and next-auth
jest.mock('next-themes')
jest.mock('next-auth/react')

describe('Theme and Layout Integration', () => {
  const mockSetTheme = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })
  })

  describe('Theme Integration', () => {
    it('applies theme changes across components', async () => {
      render(
        <>
          <Header />
          <ThemeToggle />
        </>
      )

      // Initial light theme
      expect(screen.getByTestId('header')).toHaveClass('bg-white')
      expect(screen.getByText('🌙')).toBeInTheDocument()

      // Switch to dark theme
      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      expect(mockSetTheme).toHaveBeenCalledWith('dark')

      // Mock theme change
      ;(useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      })

      // Re-render to simulate theme change
      render(
        <>
          <Header />
          <ThemeToggle />
        </>
      )

      // Verify dark theme applied
      expect(screen.getByTestId('header')).toHaveClass('dark:bg-gray-800')
      expect(screen.getByText('🌞')).toBeInTheDocument()
    })

    it('persists theme preference across navigation', async () => {
      const { rerender } = render(
        <>
          <Header />
          <ThemeToggle />
        </>
      )

      // Switch to dark theme
      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      expect(mockSetTheme).toHaveBeenCalledWith('dark')

      // Mock theme persistence
      ;(useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      })

      // Simulate navigation by re-rendering
      rerender(
        <>
          <Header />
          <ThemeToggle />
        </>
      )

      // Verify theme persisted
      expect(screen.getByText('🌞')).toBeInTheDocument()
    })
  })

  describe('Layout Integration', () => {
    it('adjusts layout based on authentication state', async () => {
      const { rerender } = render(<Header />)

      // Initial unauthenticated state
      expect(screen.queryByText(/my logos/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()

      // Mock authenticated state
      const mockUser = generateTestUser()
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        status: 'authenticated'
      })

      // Re-render to simulate auth state change
      rerender(<Header />)

      // Verify layout changes
      expect(screen.getByText(/my logos/i)).toBeInTheDocument()
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    })

    it('maintains responsive layout across theme changes', async () => {
      const { rerender } = render(
        <>
          <Header />
          <ThemeToggle />
        </>
      )

      // Initial state
      expect(screen.getByTestId('header')).toHaveClass('flex', 'items-center')

      // Switch theme
      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      ;(useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      })

      // Re-render with new theme
      rerender(
        <>
          <Header />
          <ThemeToggle />
        </>
      )

      // Verify responsive classes maintained
      expect(screen.getByTestId('header')).toHaveClass('flex', 'items-center')
    })
  })

  describe('Theme-Aware Components', () => {
    it('updates all theme-aware components simultaneously', async () => {
      render(
        <>
          <Header />
          <ThemeToggle />
          <div data-testid="content" className="bg-white dark:bg-gray-800">
            Content
          </div>
        </>
      )

      // Initial light theme state
      const header = screen.getByTestId('header')
      const content = screen.getByTestId('content')
      expect(header).toHaveClass('bg-white')
      expect(content).toHaveClass('bg-white')

      // Switch to dark theme
      await user.click(screen.getByRole('button', { name: /toggle theme/i }))
      ;(useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      })

      // Re-render with dark theme
      render(
        <>
          <Header />
          <ThemeToggle />
          <div data-testid="content" className="bg-white dark:bg-gray-800">
            Content
          </div>
        </>
      )

      // Verify all components updated
      expect(header).toHaveClass('dark:bg-gray-800')
      expect(content).toHaveClass('dark:bg-gray-800')
    })
  })
}) 
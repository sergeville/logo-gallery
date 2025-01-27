import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from 'next-themes'
import React from 'react'
import ThemeToggle from '../ThemeToggle'

// Mock next-themes
jest.mock('next-themes')

describe('ThemeToggle', () => {
  const mockSetTheme = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    })
  })

  describe('Rendering', () => {
    it('shows moon icon in light mode', () => {
      render(<ThemeToggle />)
      expect(screen.getByText('🌙')).toBeInTheDocument()
    })

    it('shows sun icon in dark mode', () => {
      ;(useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      })
      render(<ThemeToggle />)
      expect(screen.getByText('🌞')).toBeInTheDocument()
    })

    it('shows moon icon when not mounted', () => {
      // Mock useEffect to prevent mounting
      jest.spyOn(React, 'useEffect').mockImplementation(() => {})
      render(<ThemeToggle />)
      expect(screen.getByText('🌙')).toBeInTheDocument()
    })
  })

  describe('Theme Switching', () => {
    it('toggles from light to dark theme', async () => {
      render(<ThemeToggle />)
      await user.click(screen.getByRole('button'))
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('toggles from dark to light theme', async () => {
      ;(useTheme as jest.Mock).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme
      })
      render(<ThemeToggle />)
      await user.click(screen.getByRole('button'))
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Accessibility', () => {
    it('has accessible button role', () => {
      render(<ThemeToggle />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has hover styles', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-gray-100 dark:hover:bg-gray-700')
    })
  })
}) 
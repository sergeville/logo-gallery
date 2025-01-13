import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

interface HeaderProps {
  onLoginClick: () => void
}

export default function Header({ onLoginClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4" data-testid="gallery-header">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold" data-testid="gallery-title">Logo Gallery</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
            data-testid="theme-toggle"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
          {user ? (
            <div className="relative" data-testid="user-menu">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2"
                data-testid="user-menu-button"
              >
                <span data-testid="user-welcome">Welcome, {user.username}</span>
              </button>
              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
                  data-testid="user-menu-dropdown"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      data-testid="logout-button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              data-testid="login-button"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
} 
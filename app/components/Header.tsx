'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'
import { AuthModal } from './AuthModal'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const env = process.env.NODE_ENV || 'development'
  const dbName = env === 'development' ? 'LogoGalleryDevelopmentDB' : 
                 env === 'test' ? 'LogoGalleryTestDB' : 
                 'LogoGalleryDB'

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const handleLoginSuccess = () => {
    setShowAuthModal(false)
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left section - Logo and Environment */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Logo Gallery
          </Link>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {env} | {dbName}
          </span>
        </div>

        {/* Center section - Main navigation */}
        <nav className="flex-1 flex justify-center items-center space-x-8 mx-4">
          <Link 
            href="/gallery" 
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Gallery
          </Link>
          <Link 
            href="/voting" 
            className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors"
          >
            Vote
          </Link>
        </nav>

        {/* Right section - Auth & Theme */}
        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="text-gray-600 dark:text-gray-300">Loading...</div>
          ) : session ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:inline-flex rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
              >
                Upload Logo
              </Link>
              <div className="relative group">
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                >
                  <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
                  <span className="sm:hidden">Profile</span>
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </header>
  )
} 
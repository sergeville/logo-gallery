'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0f1524] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and mobile menu button */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold">Logo Gallery</span>
            </Link>
            {/* Mobile menu button */}
            <button
              type="button"
              className="ml-4 md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsOpen(!isOpen)}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              aria-label="Open menu"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/gallery"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Gallery
            </Link>
            <Link
              href="/vote"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Vote
            </Link>
            {session && (
              <Link
                href="/profile"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                My Logos
              </Link>
            )}
            {session?.user ? (
              <>
                <Link
                  href="/upload"
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Upload Logo
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span className="text-sm text-gray-300 font-medium">
                    {session.user.name}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/gallery"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Gallery
            </Link>
            <Link
              href="/vote"
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              Vote
            </Link>
            {session && (
              <Link
                href="/profile"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                My Logos
              </Link>
            )}
            {session?.user ? (
              <>
                <Link
                  href="/upload"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Upload Logo
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  {session.user.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Sign In
              </Link>
            )}
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 
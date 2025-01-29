'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#0f1524] h-12 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="text-sm font-medium hover:text-white">
            Logo Gallery
          </Link>

          {/* Right side menu */}
          <div className="flex items-center space-x-6">
            {/* Main navigation - desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/gallery" className="text-sm font-medium hover:text-white">
                Gallery
              </Link>
              <Link href="/vote" className="text-sm font-medium hover:text-white">
                Vote
              </Link>
              {session?.user && (
                <>
                  <Link href="/mylogos" className="text-sm font-medium hover:text-white">
                    My Logos
                  </Link>
                  <Link href="/upload" className="text-sm font-medium hover:text-white">
                    Upload Logo
                  </Link>
                </>
              )}
            </div>

            <ThemeToggle />
            
            {/* User menu / Auth buttons */}
            {session?.user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="text-sm font-medium hover:text-white"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:text-white"
              data-testid="mobile-menu-button"
              aria-label="Open menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/gallery"
                className="block px-3 py-2 text-sm font-medium hover:text-white"
              >
                Gallery
              </Link>
              <Link
                href="/vote"
                className="block px-3 py-2 text-sm font-medium hover:text-white"
              >
                Vote
              </Link>
              {session?.user && (
                <>
                  <Link
                    href="/mylogos"
                    className="block px-3 py-2 text-sm font-medium hover:text-white"
                  >
                    My Logos
                  </Link>
                  <Link
                    href="/upload"
                    className="block px-3 py-2 text-sm font-medium hover:text-white"
                  >
                    Upload Logo
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 
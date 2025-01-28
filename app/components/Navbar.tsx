'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-[#0f1524] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo only */}
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold">Logo Gallery</span>
          </Link>

          {/* Right side - All navigation items */}
          <div className="flex items-center space-x-8">
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
      </div>
    </nav>
  );
} 
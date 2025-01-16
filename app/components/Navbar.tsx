'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-[#1C1C1E] text-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">
            Logo Gallery
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/gallery" className="hover:text-gray-300">
              Gallery
            </Link>
            <Link href="/vote" className="hover:text-gray-300">
              Vote
            </Link>
            {user && (
              <Link href="/profile" className="hover:text-gray-300">
                My Logos
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link 
                href="/upload" 
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
              >
                Upload Logo
              </Link>
              <Link href="/profile" className="hover:text-gray-300">
                Test User
              </Link>
              <Link href="/api/auth/signout" className="hover:text-gray-300">
                Logout
              </Link>
              <span className="text-yellow-400">👑</span>
            </>
          ) : (
            <Link href="/api/auth/signin" className="hover:text-gray-300">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 
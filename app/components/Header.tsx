'use client';

import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-[#0f1524] h-12 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-400 hover:text-white">
              Logo Gallery
            </Link>
          </div>

          {/* Right side - Navigation */}
          <div className="hidden sm:flex items-center space-x-6">
            <Link
              href="/gallery"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Gallery
            </Link>
            {session && (
              <>
                <Link
                  href="/my-logos"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  My Logos
                </Link>
                <Link
                  href="/upload"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Upload Logo
                </Link>
              </>
            )}
            
            {/* User Menu */}
            {status === 'loading' ? (
              <div className="animate-pulse h-8 w-8 rounded-full bg-gray-700" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
} 
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Logo Gallery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and share beautiful logos from around the world
          </p>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Latest Uploads
          </h2>
          {session?.user ? (
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {session.user.name}!
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to upload and share your logos
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
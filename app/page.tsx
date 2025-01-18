'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f1524]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Logo Gallery
          </h1>
          <p className="text-xl text-gray-300">
            Discover and share beautiful logos from around the world
          </p>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Latest Uploads
          </h2>
          {session?.user ? (
            <div className="space-y-4">
              <p className="text-gray-300">
                Welcome back, {session.user.name}!
              </p>
              <Link
                href="/mylogos"
                className="inline-block btn-primary"
              >
                View My Logos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300">
                Sign in to upload and share your logos
              </p>
              <Link
                href="/auth/signin?modal=1"
                className="inline-block btn-primary"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  totalLogos: number;
}

interface PaginationData {
  current: number;
  total: number;
  hasMore: boolean;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (session?.user) {
      fetchUsers();
    }
  }, [session, status]);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Users</h1>
        
        <div className="grid gap-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-6">
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  <Image
                    src="/default-avatar.png"
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  {user.bio && (
                    <p className="mt-2 text-gray-700">{user.bio}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-4">
                    {user.location && (
                      <span className="text-sm text-gray-600">
                        📍 {user.location}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        🌐 Website
                      </a>
                    )}
                    <span className="text-sm text-gray-600">
                      📅 Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      🎨 {user.totalLogos} logos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pagination && pagination.total > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchUsers(page)}
                className={`px-4 py-2 rounded ${
                  page === pagination.current
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-500 hover:bg-blue-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import LogoCard from '@/app/components/LogoCard';

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  totalLogos: number;
  totalVotes: number;
  averageRating: number;
}

interface UserLogo {
  _id: string;
  name: string;
  imageUrl: string;
  uploadedAt: string;
  averageRating: number;
  totalVotes: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logos, setLogos] = useState<UserLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (session?.user) {
      fetchUserProfile();
      fetchUserLogos();
    }
  }, [session, status]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    }
  };

  const fetchUserLogos = async () => {
    try {
      const response = await fetch('/api/user/logos');
      if (!response.ok) throw new Error('Failed to fetch logos');
      const data = await response.json();
      setLogos(data.logos);
    } catch (err) {
      setError('Failed to load logos');
      console.error('Error fetching logos:', err);
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              <Image
                src={session?.user?.image || '/default-avatar.png'}
                alt={session?.user?.name || 'Profile'}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-gray-600">{profile?.email}</p>
              {profile?.bio && (
                <p className="mt-2 text-gray-700">{profile.bio}</p>
              )}
              <div className="mt-4 flex gap-4">
                {profile?.location && (
                  <span className="text-sm text-gray-600">
                    📍 {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🌐 Website
                  </a>
                )}
                <span className="text-sm text-gray-600">
                  📅 Joined {new Date(profile?.joinedDate || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile?.totalLogos || 0}</div>
              <div className="text-gray-600">Logos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile?.totalVotes || 0}</div>
              <div className="text-gray-600">Total Votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {profile?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* User's Logos */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Logos</h2>
          {logos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">You haven't uploaded any logos yet.</p>
              <button
                onClick={() => router.push('/upload')}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Upload Your First Logo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logos.map((logo) => (
                <LogoCard
                  key={logo._id}
                  name={logo.name}
                  imageUrl={logo.imageUrl}
                  uploadedAt={new Date(logo.uploadedAt)}
                  rating={logo.averageRating}
                  totalVotes={logo.totalVotes}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
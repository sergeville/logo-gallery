'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ClientLogo } from '@/app/lib/types';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AdminLogoCardProps {
  logo: ClientLogo;
  onUpdateOwner: (logoId: string, newOwnerId: string) => Promise<void>;
  users: Array<{ id: string; name: string; email: string }>;
}

export function AdminLogoCard({ logo, onUpdateOwner, users }: AdminLogoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleUpdateOwner = async () => {
    if (!selectedUserId) return;
    setIsUpdating(true);
    try {
      await onUpdateOwner(logo.id, selectedUserId);
    } catch (error) {
      console.error('Error updating owner:', error);
    } finally {
      setIsUpdating(false);
      setSelectedUserId('');
    }
  };

  // Format owner name to handle both email and name consistently
  const displayOwner = () => {
    if (!logo.ownerName) return 'Unknown owner';
    // If it's an email address, show only the part before @
    if (logo.ownerName.includes('@')) {
      return logo.ownerName.split('@')[0];
    }
    return logo.ownerName;
  };

  if (!session?.user || (session.user as any).role !== 'admin') {
    return null;
  }

  // Ensure we have a valid image URL
  const imageUrl = logo.imageUrl || '/placeholder-image.png';

  return (
    <div className="bg-[#0A1A2F] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
      <div className="relative aspect-[4/3] mb-4 bg-gray-800 rounded-lg overflow-hidden">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {imageError ? (
          <Image
            src="/placeholder-logo.png"
            alt="Logo placeholder"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <Image
            src={logo.imageUrl || '/placeholder-logo.png'}
            alt={logo.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
            onLoadingComplete={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white truncate">{logo.name}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">
              {logo.totalVotes || 0} votes
            </span>
            <button
              onClick={() => router.push(`/gallery/${logo.id}/edit`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Edit
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span className="inline-block w-6 h-6 rounded-full bg-gray-700 flex-shrink-0"></span>
            {!logo.ownerName ? (
              <>
                <Link 
                  href={`/gallery/${logo.id}/edit`}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Unknown owner
                </Link>
                <Link 
                  href={`/gallery/${logo.id}/edit`}
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Update Owner
                </Link>
              </>
            ) : (
              <span className="text-gray-300">{displayOwner()}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select new owner</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || (user.email ? user.email.split('@')[0] : 'Unknown owner')}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateOwner}
              disabled={!selectedUserId || isUpdating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedUserId || isUpdating
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isUpdating ? 'Updating...' : 'Update Owner'}
            </button>
          </div>
        </div>
        
        {logo.tags && logo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {logo.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full font-medium hover:bg-gray-700 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
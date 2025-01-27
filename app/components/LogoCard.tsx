'use client'

import { formatDistanceToNow } from 'date-fns'
import { Star } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface LogoCardProps {
  name: string
  imageUrl: string
  uploadedAt: string | Date
  totalVotes: number
  rating?: number
  isVoted?: boolean
  onVote?: () => void
  isRadioStyle?: boolean
  priority?: boolean
  ownerName: string
  ownerId?: string
}

export default function LogoCard({ 
  name, 
  imageUrl, 
  uploadedAt, 
  totalVotes = 0, 
  rating = 0,
  isVoted = false,
  onVote,
  isRadioStyle = false,
  priority = false,
  ownerName,
  ownerId
}: LogoCardProps) {
  const { data: session } = useSession()
  const isOwner = session?.user?.id === ownerId
  const [imageError, setImageError] = useState(false)

  const handleVote = () => {
    if (onVote) {
      onVote();
    }
  };

  const getUploadedDate = () => {
    try {
      const date = typeof uploadedAt === 'string' ? new Date(uploadedAt) : uploadedAt;
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid date';
    }
  };

  const displayRating = typeof rating === 'number' && !isNaN(rating) 
    ? rating.toFixed(1) 
    : '0.0';

  // Ensure the image URL is absolute and properly formatted
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : imageUrl.startsWith('/') 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${imageUrl}`
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/uploads/${imageUrl}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
      <div className="relative aspect-video">
        {!imageError ? (
          <img
            src={fullImageUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <span className="text-gray-400 block">Image not available</span>
              <span className="text-gray-500 text-sm block mt-1">ID: {imageUrl.split('/').pop()}</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <Link 
              href={`/profile/${ownerId}`}
              className="hover:text-primary-blue dark:hover:text-blue-400 transition-colors"
            >
              {ownerName}{isOwner && " (You)"}
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <Star
              className={`h-5 w-5 ${
                isVoted ? 'text-yellow-400 fill-current' : 'text-gray-400'
              } ${isRadioStyle ? 'cursor-pointer' : ''}`}
              onClick={isRadioStyle ? handleVote : undefined}
            />
            <span>{displayRating}</span>
            <span>({totalVotes})</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {getUploadedDate()}
          </span>
        </div>
      </div>
    </div>
  )
} 
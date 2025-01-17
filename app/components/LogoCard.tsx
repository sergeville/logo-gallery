'use client'

import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Star, User } from 'lucide-react'

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
  ownerName
}: LogoCardProps) {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
      <div className="relative aspect-video">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-400" />
            <span>{ownerName}</span>
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
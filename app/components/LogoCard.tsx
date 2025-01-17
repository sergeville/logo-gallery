'use client'

import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Star } from 'lucide-react'

interface LogoCardProps {
  name: string
  imageUrl: string
  uploadedAt: string | Date
  totalVotes: number
  rating: number
  isVoted?: boolean
  onVote?: () => void
  isRadioStyle?: boolean
}

export default function LogoCard({ 
  name, 
  imageUrl, 
  uploadedAt, 
  totalVotes, 
  rating,
  isVoted = false,
  onVote,
  isRadioStyle = false
}: LogoCardProps) {
  const handleVote = () => {
    if (onVote) {
      onVote();
    }
  };

  const getUploadedDate = () => {
    const date = typeof uploadedAt === 'string' ? new Date(uploadedAt) : uploadedAt;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
      <div className="relative aspect-video">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <Star
              className={`h-5 w-5 ${
                isVoted ? 'text-yellow-400 fill-current' : 'text-gray-400'
              } ${isRadioStyle ? 'cursor-pointer' : ''}`}
              onClick={isRadioStyle ? handleVote : undefined}
            />
            <span>{rating.toFixed(1)}</span>
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
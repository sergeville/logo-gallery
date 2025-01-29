'use client'

import React from 'react'
import { formatDistanceToNow, isValid, parseISO } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import DeleteLogoButton from '@/app/components/DeleteLogoButton'
import LogoImage from '@/app/components/LogoImage'

interface Logo {
  _id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  responsiveUrls?: Record<string, string>
  userId: string
  createdAt: string | Date
  totalVotes?: number
  fileSize?: number
  optimizedSize?: number
  compressionRatio?: string
}

interface LogoCardProps {
  logo: Logo
  showDelete?: boolean
  showStats?: boolean
}

export default function LogoCard({ 
  logo, 
  showDelete = false,
  showStats = false,
}: LogoCardProps) {
  const { data: session } = useSession()
  const isOwner = session?.user?.id === logo.userId

  const getUploadedDate = () => {
    try {
      if (!logo.createdAt) {
        return 'Unknown date'
      }

      let date: Date
      if (typeof logo.createdAt === 'string') {
        date = parseISO(logo.createdAt)
      } else {
        date = logo.createdAt
      }

      if (!isValid(date)) {
        return 'Unknown date'
      }

      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown date'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <div 
      data-testid="logo-card"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
    >
      <div className="relative">
        {/* Vote count overlay */}
        <div 
          data-testid="vote-count"
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 rounded-full px-4 py-2"
        >
          <span className="text-3xl font-bold text-white">
            {logo.totalVotes || 0}
          </span>
        </div>
        <LogoImage
          src={logo.thumbnailUrl}
          alt={`Logo: ${logo.title} - ${logo.description}`}
          responsiveUrls={logo.responsiveUrls}
          className="w-full aspect-square"
          data-testid="logo-image"
        />
      </div>

      <div className="p-4">
        <h3 
          data-testid="logo-title"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
        >
          {logo.title}
        </h3>
        <p 
          data-testid="logo-description"
          className="text-gray-600 dark:text-gray-400 text-sm mb-4"
        >
          {logo.description}
        </p>

        {showStats && (
          <div className="mb-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">Original:</span>{' '}
                {formatFileSize(logo.fileSize)}
              </div>
              <div>
                <span className="font-medium">Optimized:</span>{' '}
                {formatFileSize(logo.optimizedSize)}
              </div>
              {logo.compressionRatio && (
                <div className="col-span-2">
                  <span className="font-medium">Compression:</span>{' '}
                  {logo.compressionRatio}% saved
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span 
            data-testid="upload-date"
            className="text-gray-500 dark:text-gray-400"
          >
            {getUploadedDate()}
          </span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Link
            href={`/logos/${logo._id}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
            data-testid="view-details-link"
          >
            View Details
          </Link>
          {showDelete && isOwner && (
            <DeleteLogoButton logoId={logo._id} />
          )}
        </div>
      </div>
    </div>
  )
} 
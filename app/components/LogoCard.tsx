'use client'

import React, { useState } from 'react'
import { formatDistanceToNow, isValid, parseISO } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import DeleteLogoButton from '@/app/components/DeleteLogoButton'
import Image from 'next/image'

interface Logo {
  _id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  responsiveUrls?: Record<string, string>
  userId: string
  createdAt: string | Date | undefined
  totalVotes?: number
  fileSize?: number
  optimizedSize?: number
  compressionRatio?: string
}

interface LogoCardProps {
  logo: Logo
  showDelete?: boolean
  showStats?: boolean
  isOwner?: boolean
  onError?: (error: Error) => void
}

export default function LogoCard({ 
  logo, 
  showDelete = false,
  showStats = false,
  isOwner = false,
  onError
}: LogoCardProps) {
  const { data: session } = useSession()
  const userIsOwner = isOwner || session?.user?.id === logo.userId
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      onError?.(new Error('Failed to format date'))
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

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
    onError?.(new Error('Failed to load logo image'))
  }

  return (
    <div 
      data-testid="logo-card"
      className="bg-white dark:bg-gray-800/50 rounded-lg shadow-lg overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl border border-gray-100 dark:border-gray-700"
    >
      <div className="relative aspect-square bg-gray-50 dark:bg-gray-900/50">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
        )}

        {/* Vote count overlay */}
        <div 
          data-testid="vote-count"
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 backdrop-blur-sm rounded-full px-4 py-1"
        >
          <span className="text-2xl font-bold text-white">
            {logo.totalVotes || 0}
          </span>
        </div>

        {/* Image */}
        <Image
          src={imageError ? '/placeholder-logo.png' : (logo.thumbnailUrl || logo.imageUrl)}
          alt={logo.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4"
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          priority={false}
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
          className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2"
        >
          {logo.description}
        </p>
        {showStats && (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uploaded {getUploadedDate()}
            </p>
            {logo.fileSize && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Original size: {formatFileSize(logo.fileSize)}
              </p>
            )}
            {logo.optimizedSize && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Optimized size: {formatFileSize(logo.optimizedSize)}
              </p>
            )}
            {logo.compressionRatio && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Compression ratio: {logo.compressionRatio}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-between items-center">
          <Link
            href={`/logos/${logo._id}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            data-testid="view-details-link"
          >
            View Details
          </Link>
          {showDelete && userIsOwner && (
            <DeleteLogoButton 
              logoId={logo._id} 
              onError={(error) => onError?.(error)}
            />
          )}
        </div>
      </div>
    </div>
  )
} 
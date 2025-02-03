/**
 * Voting Page Component
 * 
 * Displays a grid of logos that users can vote for. Features:
 * - Shows all available logos with their details
 * - Indicates which logo has the user's current vote
 * - Allows users to change their vote
 * - Handles authentication and redirects
 * - Updates vote counts in real-time
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LogoImage from '@/app/components/LogoImage'

// Define the Logo interface with all required properties
interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  userId: string;
  ownerName: string;
  totalVotes: number;
  votes?: { userId: string }[]; // Used to track who has voted
}

export default function VotePage() {
  // State management for logos and UI
  const [logos, setLogos] = useState<Logo[]>([])
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [deadline, setDeadline] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newDeadline, setNewDeadline] = useState<string>('')
  
  // Check if user is admin
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  // Fetch logos and handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch logos
        const logosResponse = await fetch('/api/logos')
        if (!logosResponse.ok) {
          throw new Error('Failed to fetch logos')
        }
        const logosData = await logosResponse.json()
        setLogos(logosData.logos)

        // Fetch voting deadline
        const deadlineResponse = await fetch('/api/voting-deadline')
        if (!deadlineResponse.ok) {
          throw new Error('Failed to fetch voting deadline')
        }
        const deadlineData = await deadlineResponse.json()
        setDeadline(deadlineData.deadline)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, router])

  // Handle the voting process
  const handleVote = async () => {
    if (!selectedLogo) {
      setError('Please select a logo to vote')
      return
    }

    try {
      const response = await fetch(`/api/logos/${selectedLogo}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit vote')
      }

      const data = await response.json()
      // Update the UI to reflect the new vote count
      setLogos(prevLogos => 
        prevLogos.map(logo => 
          logo._id === selectedLogo 
            ? { ...logo, totalVotes: data.logo.totalVotes }
            : logo
        )
      )

      // Show success state briefly before redirecting
      setError(null)
      setTimeout(() => {
        router.push('/gallery')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote')
    }
  }

  // Handle deadline update
  const handleDeadlineUpdate = async () => {
    try {
      const response = await fetch('/api/voting-deadline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deadline: newDeadline }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update deadline')
      }

      setDeadline(newDeadline)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deadline')
    }
  }

  // Handle unauthenticated state
  if (!session) {
    return null // Redirect handled by useEffect
  }

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"
              role="status"
              aria-label="Loading"
              data-testid="loading-spinner"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main voting interface
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section with title and instructions */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vote for Your Favorite Logo
          </h1>
          {deadline && (
            <div className="mt-4">
              {isEditing && isAdmin ? (
                <div className="flex items-center justify-center space-x-2">
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 dark:text-white dark:bg-gray-800"
                  />
                  <button
                    onClick={handleDeadlineUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <p data-testid="voting-deadline" className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                    Voting ends: {deadline}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setNewDeadline(deadline)
                        setIsEditing(true)
                      }}
                      className="ml-2 p-2 text-blue-600 hover:text-blue-700"
                      aria-label="Edit deadline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Select your favorite logo. You can change your vote by selecting a different logo.
          </p>
          {error && (
            <p data-testid="error-message" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Logo grid */}
        <div data-testid="logo-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => {
            const isVoted = logo.votes?.some(vote => vote.userId === session?.user?.id);
            return (
              <div
                key={logo._id}
                data-testid="logo-card"
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-200 ${
                  selectedLogo === logo._id
                    ? 'ring-2 ring-blue-500 transform scale-105'
                    : 'hover:shadow-lg'
                }`}
              >
                {/* Logo image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                  <LogoImage
                    src={logo.thumbnailUrl || logo.imageUrl}
                    alt={`Logo: ${logo.name || logo.title} by ${logo.ownerName}`}
                    className="p-4"
                    priority={false}
                    quality={75}
                  />
                </div>
                {/* Logo details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {logo.name || logo.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {logo.ownerName}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                    {logo.description}
                  </p>
                  {/* Vote count */}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {logo.totalVotes || 0} votes
                    </p>
                    {isVoted && (
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Your current vote
                      </span>
                    )}
                  </div>
                  {/* Voting controls */}
                  <div className="mt-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="logo-vote"
                        checked={selectedLogo === logo._id}
                        onChange={() => setSelectedLogo(logo._id)}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {isVoted ? 'Currently voted' : 'Select to vote'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit button */}
        {logos.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              data-testid="submit-button"
              onClick={handleVote}
              disabled={!selectedLogo}
              aria-disabled={!selectedLogo}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit Vote
            </button>
          </div>
        )}

        {/* No logos message */}
        {logos.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              No logos available to vote on at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
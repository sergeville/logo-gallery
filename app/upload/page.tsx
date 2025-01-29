'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { imageOptimizationService } from '@/app/lib/services'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface OptimizationPreview {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  dimensions: {
    width: number
    height: number
  }
  format: string
}

export default function UploadPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [optimizationPreview, setOptimizationPreview] = useState<OptimizationPreview | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Please upload a JPEG, PNG, SVG, or WebP image.')
      return
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB.')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile)
    setPreview(previewUrl)

    // Generate optimization preview
    try {
      const buffer = await selectedFile.arrayBuffer()
      const imageBuffer = Buffer.from(buffer)
      
      const analysis = await imageOptimizationService.analyzeImage(imageBuffer)
      const optimized = await imageOptimizationService.optimizeBuffer(imageBuffer, analysis)

      setOptimizationPreview({
        originalSize: selectedFile.size,
        optimizedSize: optimized.buffer.length,
        compressionRatio: ((selectedFile.size - optimized.buffer.length) / selectedFile.size * 100),
        dimensions: {
          width: optimized.metadata.width,
          height: optimized.metadata.height,
        },
        format: optimized.metadata.format,
      })
    } catch (err) {
      console.error('Error generating optimization preview:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    formData.append('description', description)

    try {
      const response = await fetch('/api/logos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Upload failed')
      }

      router.push('/gallery')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Please sign in to upload logos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in to upload and manage logos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
              Upload Logo
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Logo Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Logo File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {preview ? (
                      <div className="relative">
                        <div className="mb-4 relative w-48 h-48 mx-auto">
                          <Image
                            src={preview}
                            alt="Logo preview"
                            fill
                            className="object-contain"
                          />
                        </div>
                        {optimizationPreview && (
                          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Original:</span>{' '}
                                {formatFileSize(optimizationPreview.originalSize)}
                              </div>
                              <div>
                                <span className="font-medium">Optimized:</span>{' '}
                                {formatFileSize(optimizationPreview.optimizedSize)}
                              </div>
                              <div>
                                <span className="font-medium">Format:</span>{' '}
                                {optimizationPreview.format.toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium">Savings:</span>{' '}
                                {optimizationPreview.compressionRatio.toFixed(1)}%
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Dimensions:</span>{' '}
                                {optimizationPreview.dimensions.width} × {optimizationPreview.dimensions.height}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, SVG, or WebP up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/gallery')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || !name || isUploading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 
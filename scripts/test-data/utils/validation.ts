import { ObjectId } from 'mongodb'

export interface User {
  _id?: string | ObjectId
  name: string
  email: string
  password?: string
  image?: string | null
}

export interface Logo {
  _id?: string | ObjectId
  name: string
  url: string
  description: string
  userId: string | ObjectId
  imageUrl: string
  thumbnailUrl?: string
  tags?: string[]
  votes?: number
  totalVotes?: number
  createdAt?: Date
  updatedAt?: Date
}

export function validateUser(user: Partial<User>): void {
  if (!user.name) {
    throw new Error('Name is required')
  }

  if (!user.email) {
    throw new Error('Email is required')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    throw new Error('Invalid email format')
  }
}

export function validateLogo(logo: Partial<Logo>): void {
  if (!logo.name) {
    throw new Error('Name is required')
  }

  if (!logo.url) {
    throw new Error('URL is required')
  }

  if (!logo.description) {
    throw new Error('Description is required')
  }

  if (!logo.userId) {
    throw new Error('User ID is required')
  }

  try {
    new URL(logo.url)
  } catch {
    throw new Error('Invalid URL format')
  }
} 
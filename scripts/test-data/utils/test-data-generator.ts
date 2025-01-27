import type { ClientUser, ClientLogo } from '@/lib/types'
import { faker } from '@faker-js/faker'

export interface TestUser extends Omit<ClientUser, 'id'> {
  id?: string
  username?: string
  password?: string
}

export interface TestLogo extends Omit<ClientLogo, 'id'> {
  id?: string
  url?: string
}

export function generateTestUser(options: Partial<TestUser> = {}): TestUser {
  const id = options.id || faker.string.uuid()
  return {
    id,
    username: options.username || faker.internet.userName(),
    email: options.email || faker.internet.email(),
    name: options.name || faker.person.fullName(),
    password: options.password || 'password123',
    role: options.role || 'user',
    favorites: options.favorites || [],
    createdAt: options.createdAt || new Date().toISOString(),
    updatedAt: options.updatedAt || new Date().toISOString()
  }
}

export function generateTestLogo(options: Partial<TestLogo> = {}): TestLogo {
  const id = options.id || faker.string.uuid()
  const ownerId = options.ownerId || faker.string.uuid()
  const ownerName = options.ownerName || faker.person.fullName()
  
  return {
    id,
    name: options.name || faker.company.name(),
    description: options.description || faker.lorem.sentence(),
    imageUrl: options.imageUrl || faker.image.url(),
    thumbnailUrl: options.thumbnailUrl || faker.image.url(),
    ownerId,
    ownerName,
    category: options.category || faker.helpers.arrayElement(['tech', 'finance', 'retail', 'other']),
    tags: options.tags || [faker.word.sample(), faker.word.sample()],
    dimensions: options.dimensions || { width: 200, height: 200 },
    fileSize: options.fileSize || faker.number.int({ min: 1000, max: 1000000 }),
    fileType: options.fileType || faker.helpers.arrayElement(['image/png', 'image/jpeg', 'image/svg+xml']),
    averageRating: options.averageRating || 0,
    totalVotes: options.totalVotes || 0,
    createdAt: options.createdAt || new Date().toISOString(),
    updatedAt: options.updatedAt || new Date().toISOString()
  }
} 
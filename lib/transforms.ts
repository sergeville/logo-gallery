import { WithId, ObjectId } from 'mongodb';
import { ClientLogo, Logo } from './types';

export function transformLogo(dbLogo: WithId<Logo>): ClientLogo {
  return {
    id: dbLogo._id?.toString() || new ObjectId().toString(),
    name: dbLogo.name || 'Untitled Logo',
    description: dbLogo.description || '',
    imageUrl: dbLogo.imageUrl || '',
    thumbnailUrl: dbLogo.thumbnailUrl || dbLogo.imageUrl || '',
    url: dbLogo.url || '',
    tags: dbLogo.tags || [],
    ownerName: dbLogo.ownerName || 'Unknown User',
    ownerId: dbLogo.userId?.toString() || new ObjectId().toString(),
    category: dbLogo.category || 'uncategorized',
    dimensions: dbLogo.dimensions || { width: 0, height: 0 },
    fileSize: dbLogo.fileSize || 0,
    fileType: dbLogo.fileType || 'unknown',
    votes: Array.isArray(dbLogo.votes) ? dbLogo.votes.length : 0,
    averageRating: typeof dbLogo.averageRating === 'number' ? dbLogo.averageRating : 0,
    totalVotes: typeof dbLogo.totalVotes === 'number' ? dbLogo.totalVotes : 0,
    createdAt: dbLogo.createdAt ? dbLogo.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: dbLogo.updatedAt ? dbLogo.updatedAt.toISOString() : new Date().toISOString()
  };
} 
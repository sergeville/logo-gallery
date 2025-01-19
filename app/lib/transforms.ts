import { WithId } from 'mongodb';
import { Logo } from '../models/Logo';

export interface ClientLogo {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId?: string | null;
  ownerName?: string;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  totalVotes: number;
  votes?: Array<{
    userId: string | null;
    rating: number;
    createdAt: string;
  }>;
}

/**
 * Transforms a server-side Logo document into a client-safe format
 * Handles ObjectId conversion, date formatting, and nested object transformation
 */
export function transformLogo(doc: WithId<Logo>): ClientLogo {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || '',
    imageUrl: doc.imageUrl || doc.url || '',
    thumbnailUrl: doc.thumbnailUrl || '',
    userId: doc.ownerId?.toString() || null,
    ownerName: doc.ownerName || 'Unknown User',
    category: doc.category || 'uncategorized',
    tags: doc.tags || [],
    dimensions: doc.dimensions || { width: 0, height: 0 },
    fileSize: doc.fileSize || 0,
    fileType: doc.fileType || 'unknown',
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
    averageRating: doc.averageRating || 0,
    totalVotes: doc.totalVotes || 0,
    votes: doc.votes?.map(vote => ({
      userId: vote.userId?.toString() || null,
      rating: vote.rating || 0,
      createdAt: vote.createdAt?.toISOString() || new Date().toISOString()
    })) || []
  };
} 
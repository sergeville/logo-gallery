import { WithId } from 'mongodb';
import { Logo } from '../models/Logo';

export interface ClientLogo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  url: string;
  thumbnailUrl: string;
  userId?: string;
  ownerName?: string;
  tags: string[];
  category: string;
  dimensions: { width: number; height: number };
  fileSize: number;
  fileType: string;
  averageRating: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transforms a server-side Logo document into a client-safe format
 * Handles ObjectId conversion, date formatting, and nested object transformation
 */
export function transformLogo(doc: WithId<Logo>): ClientLogo {
  // Handle both imageUrl and legacy url fields
  let imageUrl = '/placeholder-image.png';
  
  if (doc.imageUrl) {
    imageUrl = doc.imageUrl.startsWith('http')
      ? doc.imageUrl
      : doc.imageUrl.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${doc.imageUrl}`
        : imageUrl;
  } else if (doc.url) {
    imageUrl = doc.url.startsWith('http')
      ? doc.url
      : doc.url.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${doc.url}`
        : imageUrl;
  }

  const thumbnailUrl = doc.thumbnailUrl?.startsWith('http')
    ? doc.thumbnailUrl
    : doc.thumbnailUrl?.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${doc.thumbnailUrl}`
      : imageUrl;

  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || '',
    imageUrl,
    url: doc.url || '',
    thumbnailUrl,
    userId: doc.userId?.toString(),
    ownerName: doc.ownerName || 'Unknown owner',
    tags: doc.tags || [],
    category: doc.category || 'uncategorized',
    dimensions: doc.dimensions || { width: 0, height: 0 },
    fileSize: doc.fileSize || 0,
    fileType: doc.fileType || 'unknown',
    averageRating: doc.averageRating,
    totalVotes: doc.totalVotes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  };
} 
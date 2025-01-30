import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  profile?: {
    bio?: string;
    website?: string;
    avatar?: string;
    location?: string;
    skills?: string[];
  };
  role?: 'user' | 'admin';
  isAdmin?: boolean;
}

export interface UserProfile {
  bio?: string;
  website?: string;
  avatar?: string;
  location?: string;
  skills?: string[];
}

export interface LogoDimensions {
  width: number;
  height: number;
}

export interface Logo {
  _id: ObjectId;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: ObjectId;
  tags: string[];
  category?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
  updatedAt: Date;
  totalVotes: number;
  votes: Array<{
    userId: ObjectId;
    timestamp: Date;
  }>;
  votingDeadline?: Date;
}

export interface Comment {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  content: string;
  parentId?: ObjectId;
  createdAt: Date;
  likes?: number;
  mentions?: ObjectId[];
}

export interface Collection {
  _id: ObjectId;
  name: string;
  userId: ObjectId;
  logos: ObjectId[];
  createdAt: Date;
  isPublic: boolean;
  sharedWith?: ObjectId[];
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  fixes: ValidationError[];
}

export interface ImageOptimizationService {
  analyzeImage(buffer: Buffer): Promise<{
    dimensions: { width: number; height: number };
    size: number;
    format: string;
    quality?: number;
  }>;
  optimizeImage(buffer: Buffer, options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  }): Promise<Buffer>;
}

export interface ImageCacheService {
  cacheImage(key: string, data: { blob: Blob; timestamp: number }): Promise<void>;
  getCachedImage(key: string): Promise<{ blob: Blob; timestamp: number } | null>;
  removeImage(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Client-side types (using string IDs)
export interface ClientUser {
  id: string;
  email: string;
  name: string;
  favorites?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: string;
  ownerName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

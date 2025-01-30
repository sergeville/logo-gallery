import { ObjectId } from 'mongodb';

export interface Logo {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  responsiveUrls?: Record<string, string>;
  userId: string;
  createdAt: string;
  totalVotes?: number;
  fileSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
  votingDeadline?: string;
}

export interface User {
  _id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  fixes: ValidationError[];
} 
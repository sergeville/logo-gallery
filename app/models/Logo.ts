import { ObjectId } from 'mongodb';

export interface Logo {
  _id: ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  url?: string;
  ownerId: ObjectId;
  ownerName?: string;
  tags: string[];
  category: string;
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  totalVotes: number;
  votes?: Array<{
    userId: ObjectId;
    rating: number;
    createdAt: Date;
  }>;
} 
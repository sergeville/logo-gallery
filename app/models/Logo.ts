import { ObjectId } from 'mongodb';

export interface Logo {
  _id: ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  url?: string;  // Legacy field
  thumbnailUrl?: string;
  userId?: ObjectId;
  ownerName?: string;
  tags?: string[];
  category?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  fileType?: string;
  averageRating: number;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
} 
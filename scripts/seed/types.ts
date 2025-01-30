import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  profile: {
    bio?: string;
    website?: string;
    avatar?: string;
    location?: string;
    skills?: string[];
  };
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

export interface Relationships {
  comments: Comment[];
  collections: Collection[];
}

export interface TestDataOptions {
  logoCount?: number;
  commentsPerLogo?: number;
  maxRepliesPerComment?: number;
  collectionsPerUser?: number;
  logosPerCollection?: number;
}

export interface TestData {
  users: User[];
  logos: Logo[];
  comments: Comment[];
  collections: Collection[];
} 
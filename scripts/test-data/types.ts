export interface UserProfile {
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
  company?: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  name: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  userId: string;
  rating: number;
  createdAt: Date;
}

export interface Logo {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  ownerId: string;
  tags: string[];
  category: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  votes: Vote[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  colorSpace: string;
  hasAlpha: boolean;
  quality?: number;
}

export interface ImageAsset {
  _id: string;
  originalUrl: string;
  thumbnailUrl: string;
  metadata: ImageMetadata;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
} 
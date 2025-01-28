export interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: string;
  tags: string[];
  category: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
} 
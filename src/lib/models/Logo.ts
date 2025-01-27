import mongoose, { Schema, Document } from 'mongoose';

export interface ILogoDimensions {
  width: number;
  height: number;
}

export interface ILogo extends Document {
  name: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl: string;
  ownerId: mongoose.Types.ObjectId;
  ownerName?: string;
  tags: string[];
  category: string;
  dimensions: ILogoDimensions;
  fileSize: number;
  fileType: string;
  averageRating: number;
  totalVotes: number;
  votes?: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const LogoDimensionsSchema = new Schema<ILogoDimensions>({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
});

const VoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LogoSchema = new Schema<ILogo>({
  name: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: String,
  tags: [{ type: String }],
  category: { type: String, required: true },
  dimensions: { type: LogoDimensionsSchema, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  averageRating: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  votes: [VoteSchema]
}, {
  timestamps: true,
});

// Create indexes
LogoSchema.index({ name: 1 });
LogoSchema.index({ category: 1 });
LogoSchema.index({ tags: 1 });
LogoSchema.index({ ownerId: 1 });

export const Logo = mongoose.models.Logo || mongoose.model<ILogo>('Logo', LogoSchema); 
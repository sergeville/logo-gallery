// src/models/Logo.ts
import mongoose from 'mongoose';

interface ILogo {
  name: string;
  url: string;
  userId: mongoose.Types.ObjectId;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt?: Date;
}

const logoSchema = new mongoose.Schema<ILogo>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

export const Logo = mongoose.models.Logo || mongoose.model<ILogo>('Logo', logoSchema);

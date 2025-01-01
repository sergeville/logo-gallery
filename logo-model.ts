// src/models/Logo.ts
import mongoose from 'mongoose';

interface IVote {
  userId: mongoose.Types.ObjectId;
  value: -1 | 1;
}

interface ILogo {
  name: string;
  url: string;
  userId: mongoose.Types.ObjectId;
  description?: string;
  tags: string[];
  votes: IVote[];
  averageRating: number;
  createdAt: Date;
  updatedAt?: Date;
}

const voteSchema = new mongoose.Schema<IVote>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  value: {
    type: Number,
    enum: [-1, 1],
    required: true,
  },
});

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
  votes: [voteSchema],
  averageRating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

logoSchema.pre('save', function(next) {
  if (this.votes.length > 0) {
    const sum = this.votes.reduce((acc, vote) => acc + vote.value, 0);
    this.averageRating = sum / this.votes.length;
  }
  next();
});

export const Logo = mongoose.models.Logo || mongoose.model<ILogo>('Logo', logoSchema);

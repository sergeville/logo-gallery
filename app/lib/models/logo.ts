import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  imageUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: false,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [String],
  dimensions: {
    width: Number,
    height: Number,
  },
  fileSize: Number,
  fileType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
});

// Index for search
logoSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Logo = mongoose.models.Logo || mongoose.model('Logo', logoSchema); 
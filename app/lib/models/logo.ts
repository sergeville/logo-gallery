import mongoose, { Document, Model } from 'mongoose';

interface Vote {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
}

// Define the Logo interface
export interface ILogo extends Document {
  title: string;
  name: string; // Alias for title
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
  responsiveUrls: Map<string, string>;
  userId: mongoose.Types.ObjectId;
  ownerName?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  optimizedDimensions?: {
    width: number;
    height: number;
  };
  fileSize: number;
  optimizedSize: number;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
  uploadedAt?: Date;
  votingDeadline: Date;
  fullImageUrl: string; // Virtual property
  votes: Vote[];
  totalVotes: number;
  isOwnedBy(userId: string): boolean;
  updateTitle(newTitle: string): Promise<void>;
  compressionRatio: string;
}

// Define static methods interface
interface ILogoModel extends Model<ILogo> {
  findByUserId(userId: string): Promise<ILogo[]>;
  searchByTitle(query: string): Promise<ILogo[]>;
  safeDelete(id: string, userId: string): Promise<{ success: boolean; error?: string }>;
}

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const logoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [60, 'Title cannot be more than 60 characters long'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [200, 'Description cannot be more than 200 characters long'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required'],
  },
  originalUrl: {
    type: String,
    required: [true, 'Original image URL is required'],
  },
  responsiveUrls: {
    type: Map,
    of: String,
    default: new Map(),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    ref: 'User',
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
  },
  optimizedSize: {
    type: Number,
    required: [true, 'Optimized size is required'],
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
  dimensions: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  optimizedDimensions: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  votes: [voteSchema],
  totalVotes: {
    type: Number,
    default: 0,
  },
  votingDeadline: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // 7 days from creation
      return date;
    }
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Add a pre-save middleware to update totalVotes
logoSchema.pre('save', function(next) {
  if (this.isModified('votes')) {
    this.totalVotes = this.votes?.length || 0;
  }
  next();
});

// Add a pre-findOneAndUpdate middleware to update totalVotes
logoSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update?.$push?.votes) {
    update.$inc = update.$inc || {};
    update.$inc.totalVotes = 1;
  }
  next();
});

// Virtual for name (alias for title)
logoSchema.virtual('name').get(function(this: ILogo) {
  return this.title;
});

// Virtual for full image URL
logoSchema.virtual('fullImageUrl').get(function(this: ILogo) {
  if (this.imageUrl.startsWith('http')) {
    return this.imageUrl;
  }
  return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${this.imageUrl}`;
});

// Virtual for compression ratio
logoSchema.virtual('compressionRatio').get(function() {
  if (!this.fileSize || !this.optimizedSize) return '0';
  return ((this.fileSize - this.optimizedSize) / this.fileSize * 100).toFixed(2);
});

// Instance methods
logoSchema.methods.isOwnedBy = function(userId: string): boolean {
  return this.userId.toString() === userId;
};

logoSchema.methods.updateTitle = async function(newTitle: string): Promise<void> {
  this.title = newTitle;
  await this.save();
};

// Static methods
logoSchema.statics.findByUserId = function(userId: string): Promise<ILogo[]> {
  return this.find({ userId }).sort({ createdAt: -1 });
};

logoSchema.statics.searchByTitle = function(query: string): Promise<ILogo[]> {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

// Add safe delete method
logoSchema.statics.safeDelete = async function(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const logo = await this.findById(id).lean();
    
    if (!logo) {
      return { success: false, error: 'Logo not found' };
    }
    
    if (logo.userId.toString() !== userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    await this.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error('Error in safeDelete:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error'
    };
  }
};

// Indexes
logoSchema.index({ title: 'text', description: 'text' });
logoSchema.index({ userId: 1, title: 1 });
logoSchema.index({ createdAt: -1 });
logoSchema.index({ 'votes.userId': 1 });
logoSchema.index({ totalVotes: -1 });

// Initialize model with better error handling and logging
function initializeModel(): ILogoModel {
  try {
    // Check if model is already registered
    if (mongoose.models.Logo) {
      return mongoose.models.Logo as ILogoModel;
    }

    // Create new model
    return mongoose.model<ILogo, ILogoModel>('Logo', logoSchema);
  } catch (err) {
    console.error('Error creating Logo model:', err);
    throw err;
  }
}

// Export the model
export const Logo = initializeModel(); 
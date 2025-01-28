import mongoose, { Document, Model } from 'mongoose';

// Define the Logo interface
export interface ILogo extends Document {
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
  ownerName?: string;
  createdAt: Date;
  updatedAt: Date;
  fullImageUrl: string; // Virtual property
  isOwnedBy(userId: string): boolean;
  updateTitle(newTitle: string): Promise<void>;
}

// Define static methods interface
interface ILogoModel extends Model<ILogo> {
  findByUserId(userId: string): Promise<ILogo[]>;
  searchByTitle(query: string): Promise<ILogo[]>;
  safeDelete(id: string, userId: string): Promise<{ success: boolean; error?: string }>;
}

const logoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for your logo'],
    maxlength: [60, 'Title cannot be more than 60 characters'],
    minlength: [3, 'Title must be at least 3 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for your logo'],
    maxlength: [200, 'Description cannot be more than 200 characters'],
    minlength: [10, 'Description must be at least 10 characters'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL for your logo'],
    validate: {
      validator: function(v: string) {
        return /^\/uploads\/.*\.(png|jpg|jpeg|gif|webp)$/i.test(v);
      },
      message: 'Image URL must be a valid path to an image file'
    }
  },
  userId: {
    type: String,
    required: [true, 'Please provide a user ID'],
    index: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full image URL
logoSchema.virtual('fullImageUrl').get(function(this: ILogo) {
  return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${this.imageUrl}`;
});

// Instance methods
logoSchema.methods.isOwnedBy = function(userId: string): boolean {
  return this.userId === userId;
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

// Pre-save middleware
logoSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('description')) {
    this.updatedAt = new Date();
  }
  next();
});

// Initialize model with better error handling and logging
function initializeModel(): ILogoModel {
  console.log('Initializing Logo model...');
  
  try {
    // Check if model is already registered
    if (mongoose.models.Logo) {
      console.log('Using existing Logo model');
      return mongoose.models.Logo as ILogoModel;
    }

    // Create new model
    console.log('Creating new Logo model');
    const model = mongoose.model<ILogo, ILogoModel>('Logo', logoSchema);
    console.log('Logo model created successfully');
    return model;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating Logo model:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    throw error;
  }
}

// Export the initialized model
export const Logo = initializeModel(); 
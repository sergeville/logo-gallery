import mongoose from 'mongoose';

const votingSettingsSchema = new mongoose.Schema({
  deadline: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days from now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
votingSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get the singleton instance
votingSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Only create the model if it doesn't exist
export const VotingSettings = mongoose.models.VotingSettings || mongoose.model('VotingSettings', votingSettingsSchema); 
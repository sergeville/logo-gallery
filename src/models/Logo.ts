import mongoose from 'mongoose';

const LogoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  description: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
}, {
  timestamps: true,
});

export const Logo = mongoose.models.Logo || mongoose.model('Logo', LogoSchema);

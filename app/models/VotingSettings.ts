import mongoose from 'mongoose'

const votingSettingsSchema = new mongoose.Schema({
  deadline: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

// Use a singleton pattern to ensure we only have one settings document
votingSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne()
  if (!settings) {
    // If no settings exist, create with a default deadline (e.g., 30 days from now)
    settings = await this.create({
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  }
  return settings
}

export const VotingSettings = mongoose.models.VotingSettings || 
  mongoose.model('VotingSettings', votingSettingsSchema) 
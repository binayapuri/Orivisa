// File: server/models/Agent.model.js

const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  consultancyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultancy'
  },
  
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    officeAddress: String,
    city: String,
    state: String,
    postcode: String
  },
  
  marnNumber: {
    type: String,
    required: false,
    default: '',
    sparse: true // Allows multiple empty strings but unique non-empty values
  },
  
  marnVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'expired'],
    default: 'pending'
  },
  
  marnVerifiedAt: Date,
  marnExpiryDate: Date,
  lastOMARACheck: Date,
  
  specializations: [{
    type: String,
    enum: [
      'student_visa',
      'skilled_migration',
      'family_visa',
      'business_visa',
      'temporary_visa',
      'citizenship',
      'appeals'
    ]
  }],
  
  languages: [String],
  
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise'],
    default: 'free'
  },
  
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'cancelled'],
    default: 'inactive'
  },
  
  subscriptionExpiry: Date,
  
  commissionSettings: {
    defaultRate: { type: Number, default: 15 },
    platformFee: { type: Number, default: 7 }
  },
  
  metrics: {
    totalClients: { type: Number, default: 0 },
    activeApplications: { type: Number, default: 0 },
    completedApplications: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalCommissionsEarned: { type: Number, default: 0 }
  },
  
  bankDetails: {
    accountName: String,
    bsb: String,
    accountNumber: String,
    abn: String
  },
  
  availability: {
    isAcceptingClients: { type: Boolean, default: true },
    maxActiveClients: { type: Number, default: 50 }
  }
  
}, {
  timestamps: true
});

// Indexes
AgentSchema.index({ userId: 1 }, { unique: true });
AgentSchema.index({ marnNumber: 1 }, { unique: true, sparse: true }); // Sparse index allows multiple empty/null values
AgentSchema.index({ tenantId: 1 });
AgentSchema.index({ consultancyId: 1 });
AgentSchema.index({ marnVerificationStatus: 1, subscriptionStatus: 1 });

module.exports = mongoose.model('Agent', AgentSchema);

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
    ref: 'Consultancy',
    required: true
  },
  
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: String,
    businessAddress: String,
    city: String,
    state: String,
    postcode: String
  },
  
  // MARN Registration Details
  marnNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{7}$/, 'MARN must be 7 digits']
  },
  
  marnVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'expired', 'invalid'],
    default: 'pending'
  },
  
  marnVerifiedAt: Date,
  marnExpiryDate: Date,
  
  // Professional Details
  yearsOfExperience: Number,
  specializations: [{
    type: String,
    enum: ['student_visa', 'skilled_migration', 'family_visa', 'business_visa', 'appeals']
  }],
  
  languages: [String],
  
  // Platform Subscription
  subscriptionTier: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  
  subscriptionStatus: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active'
  },
  
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  
  // Commission Settings
  commissionRate: {
    type: Number,
    default: 15, // percentage
    min: 10,
    max: 25
  },
  
  // Performance Metrics
  metrics: {
    totalClients: { type: Number, default: 0 },
    activeApplications: { type: Number, default: 0 },
    completedApplications: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalCommissionsEarned: { type: Number, default: 0 }
  },
  
  // Exclusive Platform Agreement
  isPlatformExclusive: {
    type: Boolean,
    default: false
  },
  
  exclusivityBonusRate: {
    type: Number,
    default: 0 // Additional % for exclusive agents
  },
  
  // Compliance Flags
  complianceIssues: [{
    issue: String,
    reportedAt: Date,
    resolvedAt: Date,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  }],
  
  lastOMARACheck: Date,
  
  // Bank Details for Payouts
  bankDetails: {
    accountName: String,
    bsb: String,
    accountNumber: String,
    isVerified: Boolean
  }
  
}, {
  timestamps: true
});

// Indexes
AgentSchema.index({ marnNumber: 1 }, { unique: true });
AgentSchema.index({ consultancyId: 1 });
AgentSchema.index({ marnVerificationStatus: 1, subscriptionStatus: 1 });

module.exports = mongoose.model('Agent', AgentSchema);

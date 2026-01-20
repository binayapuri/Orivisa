// File: server/models/Commission.model.js

const mongoose = require('mongoose');

const CommissionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  transactionRef: {
    type: String,
    required: true,
    unique: true,
    default: () => `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  },
  
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // Source of Commission
  sourceType: {
    type: String,
    enum: ['college', 'insurance', 'service_fee'],
    required: true
  },
  
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // College or Insurance Provider ID
  },
  
  // Total Commission Received
  totalCommissionAmount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'AUD'
  },
  
  // Distribution Breakdown
  distribution: {
    platform: {
      percentage: Number,
      amount: Number
    },
    agent: {
      agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
      },
      percentage: Number,
      amount: Number
    },
    student: {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      percentage: Number,
      amount: Number,
      type: { type: String, default: 'cashback' }
    }
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'disputed'],
    default: 'pending'
  },
  
  // Individual Payout Tracking
  payouts: [{
    recipientType: {
      type: String,
      enum: ['platform', 'agent', 'student']
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed']
    },
    paidAt: Date,
    paymentMethod: String,
    transactionId: String
  }],
  
  // Triggered When
  triggeredBy: {
    type: String,
    enum: ['enrollment_confirmed', 'tuition_paid', 'insurance_purchased', 'service_milestone'],
    required: true
  },
  
  triggeredAt: Date,
  
  // Notes
  notes: String
  
}, {
  timestamps: true
});

// Indexes
CommissionSchema.index({ applicationId: 1 });
CommissionSchema.index({ 'distribution.agent.agentId': 1, paymentStatus: 1 });
CommissionSchema.index({ transactionRef: 1 }, { unique: true });

module.exports = mongoose.model('Commission', CommissionSchema);

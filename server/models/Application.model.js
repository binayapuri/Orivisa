// File: server/models/Application.model.js

const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  // Unique Application Reference
  applicationRef: {
    type: String,
    required: true,
    unique: true,
    default: () => `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  
  // Student
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Assigned Agent
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  
  // College/University
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  
  // Insurance (Optional)
  insuranceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsuranceProvider'
  },
  
  // Program Details
  programDetails: {
    courseName: String,
    level: String,
    campus: String,
    intake: String,
    duration: String,
    tuitionFee: Number,
    currency: { type: String, default: 'AUD' }
  },
  
  // Application Status
  status: {
    type: String,
    enum: [
      'draft',
      'form956_pending',
      'form956_signed',
      'documents_pending',
      'ready_for_submission',
      'submitted_to_college',
      'offer_received',
      'offer_accepted',
      'visa_lodged',
      'visa_granted',
      'completed',
      'withdrawn',
      'rejected'
    ],
    default: 'draft'
  },
  
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: { type: Date, default: Date.now },
    notes: String
  }],
  
  // Form 956 Reference
  form956Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form956'
  },
  
  // Service Agreement
  serviceAgreementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceAgreement'
  },
  
  // Documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  
  // Timeline & Deadlines
  timeline: {
    applicationStarted: Date,
    form956Signed: Date,
    documentsCompleted: Date,
    submittedToCollege: Date,
    offerReceived: Date,
    offerAccepted: Date,
    visaLodged: Date,
    visaGranted: Date,
    enrollmentConfirmed: Date
  },
  
  deadlines: {
    documentSubmission: Date,
    offerReply: Date,
    tuitionPayment: Date,
    visaLodgement: Date
  },
  
  // Financial Tracking
  financials: {
    tuitionFee: Number,
    applicationFee: Number,
    insuranceFee: Number,
    otherFees: Number,
    totalPaid: { type: Number, default: 0 },
    currency: { type: String, default: 'AUD' }
  },
  
  // Commission Distribution
  commissions: {
    collegeCommissionAmount: Number,
    platformShare: Number,
    agentShare: Number,
    studentCashback: Number,
    insuranceCommission: Number,
    
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    
    transactionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }]
  },
  
  // Platform Lock-in
  platformFlags: {
    isOffPlatformAttempt: { type: Boolean, default: false },
    offPlatformAttemptCount: { type: Number, default: 0 },
    lastOffPlatformDetection: Date,
    complianceWarnings: [String]
  },
  
  // Notes
  internalNotes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
  
}, {
  timestamps: true
});

// Indexes
ApplicationSchema.index({ applicationRef: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1, status: 1 });
ApplicationSchema.index({ agentId: 1, status: 1 });
ApplicationSchema.index({ collegeId: 1, status: 1 });
ApplicationSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);

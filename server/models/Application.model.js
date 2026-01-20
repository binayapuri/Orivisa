// File: server/models/Application.model.js

const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  applicationRef: {
    type: String,
    unique: true,
    // Will be auto-generated, not required in input
  },
  
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  
  consultancyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultancy'
  },
  
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  },
  
  programDetails: {
    courseName: String,
    courseCode: String,
    level: String,
    duration: String,
    intake: String,
    campus: String,
    tuitionFee: Number,
    currency: { type: String, default: 'AUD' }
  },
  
  visaDetails: {
    visaType: String,
    subclass: String,
    targetLodgeDate: Date,
    actualLodgeDate: Date,
    decisionDate: Date,
    expiryDate: Date
  },
  
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
      'coe_received',
      'visa_lodged',
      'visa_granted',
      'visa_refused',
      'completed',
      'withdrawn'
    ],
    default: 'draft'
  },
  
  workflow: {
    currentStage: String,
    stages: [{
      name: String,
      status: String,
      completedAt: Date,
      completedBy: mongoose.Schema.Types.ObjectId
    }],
    blockers: [String]
  },
  
  form956Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form956'
  },
  
  serviceAgreementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceAgreement'
  },
  
  documents: [{
    documentId: mongoose.Schema.Types.ObjectId,
    documentType: String,
    uploadedAt: Date,
    status: String
  }],
  
  timeline: [{
    event: String,
    description: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
  }],
  
  notes: [{
    content: String,
    createdBy: mongoose.Schema.Types.ObjectId,
    isPrivate: Boolean,
    createdAt: { type: Date, default: Date.now }
  }],
  
  financials: {
    totalFee: Number,
    paidAmount: Number,
    pendingAmount: Number,
    commissionEligible: Boolean,
    commissionAmount: Number,
    commissionPaid: Boolean
  },
  
  deadlines: [{
    type: String,
    date: Date,
    isCompleted: Boolean,
    completedAt: Date
  }]
  
}, {
  timestamps: true
});

// ⭐ FIXED: Generate unique application reference BEFORE validation
ApplicationSchema.pre('validate', function(next) {
  if (!this.applicationRef) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.applicationRef = `APP${year}${month}${random}`;
  }
  next();
});

// Indexes
ApplicationSchema.index({ applicationRef: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1, status: 1 });
ApplicationSchema.index({ agentId: 1, status: 1 });
ApplicationSchema.index({ tenantId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', ApplicationSchema);

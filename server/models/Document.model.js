// File: server/models/Document.model.js

const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  documentRef: {
    type: String,
    unique: true
  },
  
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  relatedTo: {
    entityType: {
      type: String,
      enum: ['application', 'student', 'agent', 'form956'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  
  documentType: {
    type: String,
    enum: [
      'passport',
      'birth_certificate',
      'academic_transcript',
      'degree_certificate',
      'english_test',
      'work_reference',
      'resume',
      'form956',
      'coe',
      'offer_letter',
      'visa_grant',
      'police_check',
      'health_assessment',
      'financial_proof',
      'other'
    ],
    required: true
  },
  
  fileName: {
    type: String,
    required: true
  },
  
  originalFileName: String,
  
  fileSize: Number, // in bytes
  
  mimeType: String,
  
  storage: {
    provider: {
      type: String,
      enum: ['local', 's3', 'azure'],
      default: 'local'
    },
    path: String, // Local path or S3 key
    url: String, // Public URL if applicable
    bucket: String // S3 bucket name
  },
  
  metadata: {
    issueDate: Date,
    expiryDate: Date,
    issuer: String,
    documentNumber: String,
    country: String
  },
  
  ocrData: {
    extracted: { type: Boolean, default: false },
    extractedAt: Date,
    data: mongoose.Schema.Types.Mixed, // Parsed text/data
    confidence: Number
  },
  
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: mongoose.Schema.Types.ObjectId,
    verifiedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: String
  },
  
  version: {
    type: Number,
    default: 1
  },
  
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  tags: [String],
  
  accessLog: [{
    accessedBy: mongoose.Schema.Types.ObjectId,
    accessedAt: { type: Date, default: Date.now },
    action: String
  }]
  
}, {
  timestamps: true
});

// Generate unique document reference
DocumentSchema.pre('validate', function(next) {
  if (!this.documentRef) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.documentRef = `DOC${year}${month}${random}`;
  }
  next();
});

// Indexes
DocumentSchema.index({ documentRef: 1 }, { unique: true });
DocumentSchema.index({ tenantId: 1 });
DocumentSchema.index({ 'relatedTo.entityType': 1, 'relatedTo.entityId': 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Document', DocumentSchema);

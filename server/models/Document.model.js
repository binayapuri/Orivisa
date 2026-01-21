// // File: server/models/Document.model.js

// const mongoose = require('mongoose');

// const DocumentSchema = new mongoose.Schema({
//   documentRef: {
//     type: String,
//     unique: true
//   },
  
//   tenantId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     index: true
//   },
  
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
//   relatedTo: {
//     entityType: {
//       type: String,
//       enum: ['application', 'student', 'agent', 'form956'],
//       required: true
//     },
//     entityId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     }
//   },
  
//   documentType: {
//     type: String,
//     enum: [
//       'passport',
//       'birth_certificate',
//       'academic_transcript',
//       'degree_certificate',
//       'english_test',
//       'work_reference',
//       'resume',
//       'form956',
//       'coe',
//       'offer_letter',
//       'visa_grant',
//       'police_check',
//       'health_assessment',
//       'financial_proof',
//       'other'
//     ],
//     required: true
//   },
  
//   fileName: {
//     type: String,
//     required: true
//   },
  
//   originalFileName: String,
  
//   fileSize: Number, // in bytes
  
//   mimeType: String,
  
//   storage: {
//     provider: {
//       type: String,
//       enum: ['local', 's3', 'azure'],
//       default: 'local'
//     },
//     path: String, // Local path or S3 key
//     url: String, // Public URL if applicable
//     bucket: String // S3 bucket name
//   },
  
//   metadata: {
//     issueDate: Date,
//     expiryDate: Date,
//     issuer: String,
//     documentNumber: String,
//     country: String
//   },
  
//   ocrData: {
//     extracted: { type: Boolean, default: false },
//     extractedAt: Date,
//     data: mongoose.Schema.Types.Mixed, // Parsed text/data
//     confidence: Number
//   },
  
//   verification: {
//     isVerified: { type: Boolean, default: false },
//     verifiedBy: mongoose.Schema.Types.ObjectId,
//     verifiedAt: Date,
//     status: {
//       type: String,
//       enum: ['pending', 'approved', 'rejected'],
//       default: 'pending'
//     },
//     rejectionReason: String
//   },
  
//   version: {
//     type: Number,
//     default: 1
//   },
  
//   previousVersionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Document'
//   },
  
//   isActive: {
//     type: Boolean,
//     default: true
//   },
  
//   tags: [String],
  
//   accessLog: [{
//     accessedBy: mongoose.Schema.Types.ObjectId,
//     accessedAt: { type: Date, default: Date.now },
//     action: String
//   }]
  
// }, {
//   timestamps: true
// });

// // Generate unique document reference
// DocumentSchema.pre('validate', function(next) {
//   if (!this.documentRef) {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = ('0' + (date.getMonth() + 1)).slice(-2);
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     this.documentRef = `DOC${year}${month}${random}`;
//   }
//   next();
// });

// // Indexes
// DocumentSchema.index({ documentRef: 1 }, { unique: true });
// DocumentSchema.index({ tenantId: 1 });
// DocumentSchema.index({ 'relatedTo.entityType': 1, 'relatedTo.entityId': 1 });
// DocumentSchema.index({ uploadedBy: 1 });
// DocumentSchema.index({ documentType: 1 });
// DocumentSchema.index({ isActive: 1 });

// module.exports = mongoose.model('Document', DocumentSchema);


const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  // ===== MULTI-TENANT & REFERENCES =====
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

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },

  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },

  // ===== FILE INFORMATION =====
  fileName: {
    type: String,
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  fileSize: Number,  // Bytes
  fileType: String,  // PDF, JPG, DOCX, etc.
  mimeType: String,

  // ===== DOCUMENT CATEGORIZATION =====
  category: {
    type: String,
    required: true,
    enum: [
      'Personal',
      'Passport & Travel',
      'Education',
      'Employment',
      'English Proficiency',
      'Financial',
      'Medical',
      'Police Clearance',
      'Skills Assessment',
      'Visa Forms',
      'Reference Letters',
      'Other'
    ],
    index: true
  },

  documentType: {
    type: String,
    required: true,
    enum: [
      'Passport',
      'Birth Certificate',
      'Marriage Certificate',
      'Divorce Decree',
      'Visa Stamp',
      'Diploma',
      'Transcript',
      'Degree Certificate',
      'IELTS Result',
      'TOEFL Result',
      'PTE Result',
      'CAE Result',
      'Employment Letter',
      'Experience Certificate',
      'Relieving Letter',
      'Reference Letter',
      'Salary Certificate',
      'Bank Statement',
      'Tax Return',
      'Investment Proof',
      'Medical Report',
      'Health Examination',
      'Vaccination Record',
      'Police Clearance',
      'Character Reference',
      'Skills Assessment Report',
      'Form 956',
      'Service Agreement',
      'Other'
    ],
    index: true
  },

  // ===== DOCUMENT DETAILS =====
  title: String,
  description: String,
  issuingAuthority: String,
  issueDate: Date,
  expiryDate: Date,
  referenceNumber: String,

  // ===== DOCUMENT STATUS & VERIFICATION =====
  status: {
    type: String,
    enum: [
      'Draft',
      'Collected',
      'Uploaded',
      'Pending Verification',
      'Verified',
      'Submitted to DIBP',
      'Approved',
      'Rejected',
      'Expired',
      'Replaced'
    ],
    default: 'Collected',
    index: true
  },

  verified: Boolean,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },
  verificationDate: Date,
  verificationNotes: String,

  // ===== REQUIREMENT TRACKING =====
  requiredForApplication: Boolean,
  mandatory: Boolean,
  dueDate: Date,
  submittedDate: Date,
  submittedToGovernment: Boolean,
  submissionDate: Date,

  // ===== VERSION CONTROL =====
  version: {
    type: Number,
    default: 1
  },

  previousVersions: [{
    fileUrl: String,
    fileSize: Number,
    uploadedDate: Date,
    version: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    reason: String  // Why replaced
  }],

  // ===== UPLOAD INFORMATION =====
  uploadedDate: {
    type: Date,
    default: Date.now
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
  },

  uploadedByName: String,

  // ===== EXPIRY TRACKING =====
  expiryWarning: {
    enabled: Boolean,
    daysBeforeExpiry: Number,
    warningsSent: [{
      sentDate: Date,
      sentTo: [mongoose.Schema.Types.ObjectId]
    }]
  },

  // ===== COMPLIANCE & TRACKING =====
  complianceStatus: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Pending Review'],
    default: 'Pending Review'
  },

  complianceNotes: String,
  checkedAgainstVisa: Boolean,
  checkDate: Date,

  // ===== SCANNING & OCR =====
  hasBeenScanned: Boolean,
  scannedDate: Date,
  ocrText: String,  // Extracted text from OCR

  // ===== NOTES & COMMENTS =====
  notes: String,

  comments: [{
    date: { type: Date, default: Date.now },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    authorName: String,
    content: String
  }],

  // ===== TRACKING =====
  inUse: Boolean,  // Currently being processed
  lastAccessedDate: Date,
  accessCount: { type: Number, default: 0 },

  // ===== METADATA =====
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  createdBy: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId

}, { timestamps: true });

// ===== INDEXES =====
documentSchema.index({ tenantId: 1, clientId: 1 });
documentSchema.index({ applicationId: 1 });
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ expiryDate: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ verified: 1 });

module.exports = mongoose.model('Document', documentSchema);

// File: server/models/Form956.model.js

const mongoose = require('mongoose');

const Form956Schema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  // Unique Form Reference
  formReference: {
    type: String,
    required: true,
    unique: true,
    default: () => `F956-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  
  // Student (Applicant)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Agent (Authorized Representative)
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  
  // Application this form is for
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // Form Data (as per official Form 956)
  formData: {
    // Part A - Applicant Details
    applicant: {
      familyName: String,
      givenNames: String,
      dateOfBirth: Date,
      passportNumber: String,
      countryOfBirth: String,
      currentAddress: String,
      email: String,
      phone: String
    },
    
    // Part B - Authorized Representative Details
    authorizedRep: {
      marnNumber: String,
      firstName: String,
      lastName: String,
      organizationName: String,
      businessAddress: String,
      email: String,
      phone: String
    },
    
    // Part C - Scope of Authority
    scopeOfAuthority: {
      visaTypes: [String],
      canReceiveCorrespondence: Boolean,
      canActOnBehalf: Boolean,
      canWithdrawApplication: Boolean
    },
    
    // Part D - Consumer Protection
    consumerGuideProvided: {
      type: Boolean,
      required: true
    },
    
    consumerGuideProvidedDate: Date,
    
    // Part E - Consent
    studentConsent: {
      type: Boolean,
      required: true
    },
    
    consentIPAddress: String,
    consentTimestamp: Date
  },
  
  // Digital Signatures
  signatures: {
    student: {
      signedAt: Date,
      ipAddress: String,
      signatureData: String, // Base64 image or digital signature
      isSigned: { type: Boolean, default: false }
    },
    agent: {
      signedAt: Date,
      ipAddress: String,
      signatureData: String,
      isSigned: { type: Boolean, default: false }
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_student_signature', 'pending_agent_signature', 'completed', 'submitted_to_dha', 'expired'],
    default: 'draft'
  },
  
  // DHA Submission
  dhaSubmission: {
    submittedAt: Date,
    submissionMethod: {
      type: String,
      enum: ['immiaccount', 'email', 'manual']
    },
    confirmationNumber: String
  },
  
  // PDF Storage
  pdfDocument: {
    s3Key: String,
    s3Bucket: String,
    generatedAt: Date
  },
  
  // Expiry (Forms typically valid for duration of application)
  expiryDate: Date,
  
  // Platform Controls
  platformMetadata: {
    generatedVia: { type: String, default: 'platform' },
    canEditOffPlatform: { type: Boolean, default: false },
    processingFeeCharged: Number,
    processingFeePaidAt: Date
  }
  
}, {
  timestamps: true
});

// Indexes
Form956Schema.index({ formReference: 1 }, { unique: true });
Form956Schema.index({ studentId: 1, agentId: 1 });
Form956Schema.index({ applicationId: 1 });
Form956Schema.index({ status: 1, expiryDate: 1 });

module.exports = mongoose.model('Form956', Form956Schema);

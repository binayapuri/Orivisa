// File: server/models/Form956.model.js

const mongoose = require('mongoose');

const Form956Schema = new mongoose.Schema({
  form956Ref: {
    type: String,
    unique: true
  },
  
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
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
  
  // Part A - Applicant Details
  applicantDetails: {
    familyName: { type: String, required: true },
    givenNames: { type: String, required: true },
    dateOfBirth: Date,
    sex: String,
    relationshipStatus: String,
    countryOfBirth: String,
    passport: {
      number: String,
      country: String,
      expiryDate: Date
    },
    currentAddress: {
      street: String,
      suburb: String,
      state: String,
      postcode: String,
      country: String
    },
    contactDetails: {
      phone: String,
      email: String
    }
  },
  
  // Part B - Authorised Recipient
  authorisedRecipient: {
    isAuthorised: { type: Boolean, default: true },
    marnNumber: String,
    fullName: String,
    businessName: String,
    address: {
      street: String,
      suburb: String,
      state: String,
      postcode: String,
      country: String
    },
    contactDetails: {
      phone: String,
      mobile: String,
      fax: String,
      email: String
    }
  },
  
  // Part C - Migration Agent Details
  migrationAgent: {
    marnNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    businessName: String,
    address: {
      street: String,
      suburb: String,
      state: String,
      postcode: String,
      country: String
    },
    contactDetails: {
      phone: String,
      mobile: String,
      fax: String,
      email: String
    }
  },
  
  // Part D - Statement and Consent
  consent: {
    understandsRole: { type: Boolean, default: false },
    providesConsent: { type: Boolean, default: false },
    authorisesRepresentation: { type: Boolean, default: false },
    agreesToTerms: { type: Boolean, default: false }
  },
  
  // Part E - Signatures
  signatures: {
    applicant: {
      name: String,
      signedAt: Date,
      ipAddress: String,
      signature: String, // Base64 or URL to signature image
      isSigned: { type: Boolean, default: false }
    },
    parent: {
      name: String,
      relationship: String,
      signedAt: Date,
      signature: String,
      isSigned: { type: Boolean, default: false }
    },
    agent: {
      name: String,
      marnNumber: String,
      signedAt: Date,
      signature: String,
      isSigned: { type: Boolean, default: false }
    }
  },
  
  status: {
    type: String,
    enum: ['draft', 'pending_signature', 'signed', 'submitted', 'expired'],
    default: 'draft'
  },
  
  generatedPDF: {
    url: String,
    s3Key: String,
    generatedAt: Date
  },
  
  submittedToHomeAffairs: {
    submitted: { type: Boolean, default: false },
    submittedAt: Date,
    referenceNumber: String
  },
  
  expiryDate: Date, // Form 956 is valid for 2 years
  
  auditTrail: [{
    action: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
  
}, {
  timestamps: true
});

// Generate unique Form 956 reference
Form956Schema.pre('validate', function(next) {
  if (!this.form956Ref) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.form956Ref = `F956-${year}${month}-${random}`;
  }
  
  // Set expiry date (2 years from creation)
  if (!this.expiryDate) {
    this.expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Indexes
Form956Schema.index({ form956Ref: 1 }, { unique: true });
Form956Schema.index({ applicationId: 1 });
Form956Schema.index({ studentId: 1 });
Form956Schema.index({ agentId: 1 });
Form956Schema.index({ tenantId: 1 });
Form956Schema.index({ status: 1 });

module.exports = mongoose.model('Form956', Form956Schema);

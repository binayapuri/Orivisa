const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // ===== MULTI-TENANT & ASSIGNMENT =====
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  consultancyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultancy',
    required: true,
    index: true
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },

  // ===== PERSONAL INFORMATION =====
  personalDetails: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: String,
    dateOfBirth: Date,
    
    passportNumber: String,
    passportCountry: String,
    passportExpiryDate: Date,
    
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'De facto', 'Divorced', 'Widowed', 'Not specified']
    },
    
    countryOfBirth: String,
    countryOfCitizenship: String,
    profilePhoto: String
  },

  // ===== OCCUPATION & SKILLS =====
  occupationDetails: {
    currentOccupation: String,
    ANZSCO: String,  // Australian and New Zealand Standard Classification of Occupations
    
    yearsOfExperience: {
      total: Number,
      inCurrentRole: Number
    },
    
    currentCompany: String,
    currentDesignation: String,
    currentSalary: Number,
    
    relevantSkills: [String],
    licenses: [String]
  },

  // ===== ENGLISH PROFICIENCY =====
  englishProficiency: {
    testType: {
      type: String,
      enum: ['IELTS', 'TOEFL', 'PTE', 'CAE', 'Not Taken', 'Exempt']
    },
    
    scores: {
      reading: Number,
      writing: Number,
      speaking: Number,
      listening: Number,
      overall: Number
    },
    
    testDate: Date,
    expiryDate: Date,
    scoreValid: Boolean,
    testReportUrl: String
  },

  // ===== POINTS BREAKDOWN (Skilled Migration) =====
  pointsBreakdown: {
    age: { type: Number, default: 0 },
    englishLanguage: { type: Number, default: 0 },
    qualifications: { type: Number, default: 0 },
    workExperience: { type: Number, default: 0 },
    stateNomination: { type: Number, default: 0 },
    otherFactors: { type: Number, default: 0 },
    total: {
      type: Number,
      default: 0,
      index: true
    }
  },

  // ===== EDUCATION QUALIFICATIONS =====
  qualifications: [{
    level: {
      type: String,
      enum: ['PhD', 'Masters', 'Bachelor', 'Diploma', 'Certificate', 'High School']
    },
    fieldOfStudy: String,
    institution: String,
    country: String,
    completionDate: Date,
    gradingPercentage: Number,
    
    documentId: mongoose.Schema.Types.ObjectId,
    verified: Boolean,
    verifiedDate: Date,
    verifiedBy: mongoose.Schema.Types.ObjectId,
    
    createdAt: { type: Date, default: Date.now }
  }],

  // ===== WORK EXPERIENCE =====
  workExperience: [{
    company: String,
    position: String,
    industry: String,
    country: String,
    city: String,
    
    startDate: Date,
    endDate: Date,
    currentlyWorking: Boolean,
    
    yearsMonths: {
      years: Number,
      months: Number
    },
    
    responsibilities: String,
    
    employmentLetterUrl: String,
    verified: Boolean,
    verifiedDate: Date,
    
    createdAt: { type: Date, default: Date.now }
  }],

  // ===== DEPENDENTS =====
  dependents: [{
    name: String,
    relationship: {
      type: String,
      enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Other']
    },
    dateOfBirth: Date,
    countryOfBirth: String,
    
    includedInApplication: Boolean,
    visaRequired: Boolean,
    
    englishProficiency: String,
    qualifications: String,
    
    createdAt: { type: Date, default: Date.now }
  }],

  // ===== VISA PREFERENCES =====
  visaPreferences: {
    primaryVisa: {
      type: String,
      enum: ['189', '190', '491', '500', '800', '820', '801', '103', '143', '600', '462', '176', '886'],
      index: true
    },
    secondaryVisas: [String],
    
    stateNominationPreference: String,
    
    targetEntryDate: Date,
    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent']
    }
  },

  // ===== CLIENT STATUS & LIFECYCLE =====
  status: {
    type: String,
    enum: [
      'Lead',
      'Initial Consultation',
      'Pre-Assessment',
      'Assessment in Progress',
      'Ready for Application',
      'Application Lodged',
      'In Processing',
      'Decision Received',
      'Approved',
      'Rejected',
      'On Hold',
      'Withdrawn',
      'Completed'
    ],
    default: 'Lead',
    index: true
  },

  statusHistory: [{
    status: String,
    changedDate: { type: Date, default: Date.now },
    changedBy: mongoose.Schema.Types.ObjectId,
    notes: String
  }],

  // ===== CONSULTANCY ASSIGNMENT =====
  assignedTeamMembers: [{
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember'
    },
    role: String,  // Primary Agent, Case Manager, Document Specialist
    assignedDate: Date
  }],

  // ===== COMMUNICATION & TRACKING =====
  communicationHistory: [{
    date: { type: Date, default: Date.now },
    communicationType: {
      type: String,
      enum: ['Email', 'Phone', 'In-Person Meeting', 'Video Call', 'Message']
    },
    subject: String,
    notes: String,
    communicatedBy: mongoose.Schema.Types.ObjectId,
    attachments: [String],
    nextFollowUpDate: Date
  }],

  lastInteractionDate: Date,
  nextScheduledFollowUp: Date,

  // ===== APPLICATIONS & CASES =====
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],

  cases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  }],

  // ===== DOCUMENTS =====
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],

  // ===== NOTES & INTERNAL TRACKING =====
  internalNotes: String,
  
  notes: [{
    date: { type: Date, default: Date.now },
    author: mongoose.Schema.Types.ObjectId,
    content: String,
    isPrivate: { type: Boolean, default: true },
    attachments: [String]
  }],

  tags: [String],
  
  riskAssessment: {
    overallRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    riskFactors: [String],
    mitigationStrategy: String,
    assessmentDate: Date,
    assessedBy: mongoose.Schema.Types.ObjectId
  },

  // ===== PAYMENT & SERVICES =====
  serviceAgreement: {
    agreementId: mongoose.Schema.Types.ObjectId,
    signedDate: Date,
    status: String
  },

  financials: {
    consultationFee: Number,
    serviceCharge: Number,
    totalFeeQuoted: Number,
    totalFeePaid: Number,
    pendingAmount: Number,
    paymentPlan: [{
      dueDate: Date,
      amount: Number,
      paid: Boolean,
      paidDate: Date
    }]
  },

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
});

// ===== INDEXES FOR PERFORMANCE =====
clientSchema.index({ tenantId: 1, consultancyId: 1 });
clientSchema.index({ agentId: 1, status: 1 });
clientSchema.index({ email: 1, tenantId: 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ status: 1, createdAt: -1 });
clientSchema.index({ 'visaPreferences.primaryVisa': 1 });
clientSchema.index({ 'pointsBreakdown.total': 1 });

module.exports = mongoose.model('Client', clientSchema);

// // File: server/models/Application.model.js

// const mongoose = require('mongoose');

// const ApplicationSchema = new mongoose.Schema({
//   applicationRef: {
//     type: String,
//     unique: true,
//     // Will be auto-generated, not required in input
//   },
  
//   tenantId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     index: true
//   },
  
//   studentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Student',
//     required: true
//   },
  
//   agentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Agent',
//     required: true
//   },
  
//   consultancyId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Consultancy'
//   },
  
//   collegeId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'College'
//   },
  
//   programDetails: {
//     courseName: String,
//     courseCode: String,
//     level: String,
//     duration: String,
//     intake: String,
//     campus: String,
//     tuitionFee: Number,
//     currency: { type: String, default: 'AUD' }
//   },
  
//   visaDetails: {
//     visaType: String,
//     subclass: String,
//     targetLodgeDate: Date,
//     actualLodgeDate: Date,
//     decisionDate: Date,
//     expiryDate: Date
//   },
  
//   status: {
//     type: String,
//     enum: [
//       'draft',
//       'form956_pending',
//       'form956_signed',
//       'documents_pending',
//       'ready_for_submission',
//       'submitted_to_college',
//       'offer_received',
//       'coe_received',
//       'visa_lodged',
//       'visa_granted',
//       'visa_refused',
//       'completed',
//       'withdrawn'
//     ],
//     default: 'draft'
//   },
  
//   workflow: {
//     currentStage: String,
//     stages: [{
//       name: String,
//       status: String,
//       completedAt: Date,
//       completedBy: mongoose.Schema.Types.ObjectId
//     }],
//     blockers: [String]
//   },
  
//   form956Id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Form956'
//   },
  
//   serviceAgreementId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'ServiceAgreement'
//   },
  
//   documents: [{
//     documentId: mongoose.Schema.Types.ObjectId,
//     documentType: String,
//     uploadedAt: Date,
//     status: String
//   }],
  
//   timeline: [{
//     event: String,
//     description: String,
//     performedBy: mongoose.Schema.Types.ObjectId,
//     timestamp: { type: Date, default: Date.now }
//   }],
  
//   notes: [{
//     content: String,
//     createdBy: mongoose.Schema.Types.ObjectId,
//     isPrivate: Boolean,
//     createdAt: { type: Date, default: Date.now }
//   }],
  
//   financials: {
//     totalFee: Number,
//     paidAmount: Number,
//     pendingAmount: Number,
//     commissionEligible: Boolean,
//     commissionAmount: Number,
//     commissionPaid: Boolean
//   },
  
//   deadlines: [{
//     type: String,
//     date: Date,
//     isCompleted: Boolean,
//     completedAt: Date
//   }]
  
// }, {
//   timestamps: true
// });

// // ⭐ FIXED: Generate unique application reference BEFORE validation
// ApplicationSchema.pre('validate', function(next) {
//   if (!this.applicationRef) {
//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = ('0' + (date.getMonth() + 1)).slice(-2);
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     this.applicationRef = `APP${year}${month}${random}`;
//   }
//   next();
// });

// // Indexes
// ApplicationSchema.index({ applicationRef: 1 }, { unique: true });
// ApplicationSchema.index({ studentId: 1, status: 1 });
// ApplicationSchema.index({ agentId: 1, status: 1 });
// ApplicationSchema.index({ tenantId: 1 });
// ApplicationSchema.index({ status: 1 });
// ApplicationSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('Application', ApplicationSchema);




const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },

  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },

  // ===== APPLICATION IDENTIFICATION =====
  applicationRef: {
    type: String,
    unique: true,
    // Auto-generated format: APP20260122+XXXX
    sparse: true
  },

  visaSubclass: {
    type: String,
    required: true,
    enum: ['189', '190', '491', '500', '800', '820', '801', '103', '143', '600', '462', '176', '886'],
    index: true
  },

  visaSubclassName: {
    type: String,
    // 189 = Skilled Independent, 190 = Skilled Sponsored, etc.
  },

  // ===== VISA DETAILS =====
  visaDetails: {
    visaType: {
      type: String,
      enum: ['Skilled Migration', 'Family Migration', 'Student', 'Temporary', 'Other']
    },

    targetLodgeDate: Date,
    actualLodgeDate: Date,
    
    decisionDate: Date,
    expiryDate: Date,
    
    visaGrantNumber: String,
    visaConditions: [String],
    
    stateNomination: String,  // For 190, 491
    skillsAssessmentDetails: {
      assessingAuthority: String,
      assessmentNumber: String,
      assessmentDate: Date,
      expiryDate: Date,
      documentUrl: String
    }
  },

  // ===== APPLICATION STATUS & WORKFLOW =====
  status: {
    type: String,
    enum: [
      'Draft',
      'Under Preparation',
      'Form 956 Pending',
      'Form 956 Signed',
      'Documents Collecting',
      'Documents Collected',
      'Ready for Submission',
      'Submitted to DIBP',
      'Visa Lodged',
      'Under Review',
      'Information Requested',
      'Second Request',
      'Medical Required',
      'Police Clearance Required',
      'Decision Made',
      'Approved',
      'Rejected',
      'Withdrawn',
      'Completed'
    ],
    default: 'Draft',
    index: true
  },

  statusHistory: [{
    status: String,
    changedDate: { type: Date, default: Date.now },
    changedBy: mongoose.Schema.Types.ObjectId,
    notes: String
  }],

  estimatedProcessingTime: Number,  // Days
  processingStartDate: Date,

  // ===== FORM 956 (AUTHORITY TO REPRESENT) =====
  form956: {
    documentId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['Not Initiated', 'Sent to Client', 'Signed', 'Verified']
    },
    sentDate: Date,
    signedDate: Date,
    expiryDate: Date,
    documentUrl: String
  },

  // ===== SERVICE AGREEMENT =====
  serviceAgreement: {
    agreementId: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: ['Not Signed', 'Signed', 'Completed', 'Terminated']
    },
    signedDate: Date,
    documentUrl: String
  },

  // ===== DOCUMENT MANAGEMENT =====
  documents: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    documentType: String,  // Passport, Education, Employment, etc.
    status: {
      type: String,
      enum: ['Pending', 'Collected', 'Verified', 'Submitted', 'Approved', 'Rejected']
    },
    uploadedDate: Date,
    submittedDate: Date,
    requiredForVisa: Boolean,
    mandatory: Boolean
  }],

  documentChecklistStatus: {
    personalDocuments: {
      status: String,  // Not Started, In Progress, Completed
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    educationDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    employmentDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    englishProofDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    financialDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    medicalDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    policeDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    },
    otherDocuments: {
      status: String,
      percentage: Number,
      dueDate: Date,
      submittedDate: Date
    }
  },

  // ===== COMMUNICATION WITH DIBP =====
  dibpCommunications: [{
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['Email', 'Portal Message', 'Phone Call', 'Official Notice']
    },
    from: String,  // DIBP / Immigration Officer
    subject: String,
    content: String,
    attachments: [String],
    responseRequired: Boolean,
    responseDeadline: Date,
    responseSubmitted: Boolean,
    responseSubmittedDate: Date,
    recordedBy: mongoose.Schema.Types.ObjectId
  }],

  // ===== VISA GRANT DETAILS (If Approved) =====
  grantDetails: {
    grantDate: Date,
    grantNumber: String,
    visaNumber: String,
    
    conditions: [String],
    
    initialEntryDate: Date,
    visaExpiryDate: Date,
    
    residenceObligation: {
      years: Number,
      months: Number,
      description: String
    },

    workRights: {
      canWork: Boolean,
      restrictions: [String]
    },

    studyRights: {
      canStudy: Boolean,
      restrictions: [String]
    }
  },

  // ===== REJECTION DETAILS (If Rejected) =====
  rejectionDetails: {
    rejectionDate: Date,
    rejectionReason: String,
    officerComments: String,
    
    appealPossible: Boolean,
    appealDeadline: Date,
    appealDetails: {
      appealLodged: Boolean,
      appealDate: Date,
      appealTribunal: String
    }
  },

  // ===== FINANCIAL TRACKING =====
  financials: {
    visaApplicationFee: Number,
    skillsAssessmentFee: Number,
    otherGovFees: Number,
    totalGovernmentFees: Number,
    
    consultancyFees: Number,
    discounts: Number,
    
    totalAmount: Number,
    paidAmount: Number,
    pendingAmount: Number,
    
    paymentSchedule: [{
      dueDate: Date,
      amount: Number,
      paid: Boolean,
      paidDate: Date,
      paymentMethod: String
    }],
    
    invoices: [{
      invoiceNumber: String,
      invoiceDate: Date,
      amount: Number,
      paidDate: Date,
      documentUrl: String
    }],

    commission: {
      eligible: Boolean,
      amount: Number,
      paid: Boolean,
      paidDate: Date
    }
  },

  // ===== DEADLINES & MILESTONES =====
  deadlines: [{
    title: String,
    description: String,
    dueDate: Date,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent']
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Overdue']
    },
    completedDate: Date,
    completedBy: mongoose.Schema.Types.ObjectId,
    notes: String
  }],

  milestones: [{
    name: String,
    description: String,
    targetDate: Date,
    actualDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Achieved', 'Delayed']
    },
    notes: String
  }],

  // ===== AGENT NOTES & TIMELINE =====
  notes: [{
    date: { type: Date, default: Date.now },
    author: mongoose.Schema.Types.ObjectId,
    authorName: String,
    content: String,
    isPrivate: { type: Boolean, default: true },
    isClientVisible: { type: Boolean, default: false },
    attachments: [String],
    type: {
      type: String,
      enum: ['Internal Note', 'Client Communication', 'DIBP Communication', 'Task']
    }
  }],

  timeline: [{
    event: String,
    description: String,
    performedBy: mongoose.Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],

  // ===== TRACKING & ANALYTICS =====
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  lastStatusUpdate: Date,
  lastActivityDate: Date,

  tags: [String],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  assignedCaseManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember'
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

}, { timestamps: true });

// ===== AUTO-GENERATE APPLICATION REFERENCE =====
applicationSchema.pre('validate', function(next) {
  if (!this.applicationRef) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.applicationRef = `APP${year}${month}${day}${random}`;
  }
  next();
});

// ===== INDEXES FOR PERFORMANCE =====
applicationSchema.index({ applicationRef: 1 }, { unique: true });
applicationSchema.index({ tenantId: 1, consultancyId: 1 });
applicationSchema.index({ clientId: 1 });
applicationSchema.index({ agentId: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ visaSubclass: 1 });
applicationSchema.index({ actualLodgeDate: 1 });
applicationSchema.index({ progressPercentage: 1 });

// ===== VIRTUAL: Visa Subclass Description =====
applicationSchema.virtual('visaDescription').get(function() {
  const visaMap = {
    '189': 'Skilled Independent',
    '190': 'Skilled Sponsored',
    '491': 'Skilled Work Regional',
    '500': 'Student Visa',
    '800': 'Partner Visa',
    '820': 'Temporary Partner',
    '801': 'Defacto Partner',
    '103': 'Parent Migration',
    '143': 'Aged Parent',
    '600': 'Visitor',
    '462': 'Special Category',
    '176': 'Distinguished Talent',
    '886': 'Skilled Dependent Family'
  };
  return visaMap[this.visaSubclass] || 'Unknown';
});

module.exports = mongoose.model('Application', applicationSchema);

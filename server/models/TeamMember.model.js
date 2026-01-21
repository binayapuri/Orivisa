const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
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

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },

  // ===== PERSONAL INFORMATION =====
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
  profilePhoto: String,

  // ===== PROFESSIONAL DETAILS =====
  role: {
    type: String,
    required: true,
    enum: [
      'Consultancy Owner',
      'Senior Migration Agent',
      'Junior Migration Agent',
      'Case Manager',
      'Document Specialist',
      'Skills Assessment Advisor',
      'Financial Advisor',
      'Administrator',
      'Support Staff'
    ],
    index: true
  },

  designation: String,
  department: String,

  // ===== MIGRATION AGENT REGISTRATION =====
  MARA: String,
  MARARegistrationNumber: String,
  MARAStatus: {
    type: String,
    enum: ['Registered', 'Suspended', 'Cancelled', 'Not Applicable']
  },
  MARAExpiryDate: Date,

  // ===== QUALIFICATIONS & EXPERTISE =====
  qualifications: [{
    qualification: String,
    issuingBody: String,
    issueDate: Date,
    expiryDate: Date,
    documentUrl: String,
    verified: Boolean
  }],

  specializations: [
    'Skilled Migration',
    'Family Migration',
    'Student Visas',
    'Business Visas',
    'Temporary Visas',
    'Partner Visas',
    'Parent Visas',
    'Points Calculation',
    'Skills Assessment'
  ],

  yearsOfExperience: Number,
  expertiseLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  },

  // ===== WORK ASSIGNMENT =====
  clientsAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }],

  casesAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  }],

  currentWorkload: {
    activeClients: { type: Number, default: 0 },
    activeCases: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    overdueTasks: { type: Number, default: 0 }
  },

  // ===== WORKING SCHEDULE =====
  workingHours: {
    startTime: String,  // "09:00"
    endTime: String,    // "17:00"
    daysWorking: [String],  // ["Monday", "Tuesday", ...]
    timezone: String
  },

  // ===== EMPLOYMENT STATUS =====
  employmentStatus: {
    type: String,
    enum: ['Active', 'On Leave', 'Inactive', 'Terminated'],
    default: 'Active',
    index: true
  },

  joinDate: Date,
  
  leaveDetails: {
    onLeaveSince: Date,
    leaveEndDate: Date,
    leaveReason: String,
    leaveType: {
      type: String,
      enum: ['Annual Leave', 'Sick Leave', 'Maternity Leave', 'Other']
    }
  },

  // ===== PERFORMANCE METRICS =====
  performanceMetrics: {
    tasksCompleted: { type: Number, default: 0 },
    casesHandled: { type: Number, default: 0 },
    visasGranted: { type: Number, default: 0 },
    visasRejected: { type: Number, default: 0 },
    visasWithdrawn: { type: Number, default: 0 },
    
    averageCompletionTime: Number,  // Days
    successRate: Number,  // Percentage
    clientSatisfactionRating: {
      type: Number,
      min: 0,
      max: 5
    },
    
    lastPerformanceReviewDate: Date,
    nextPerformanceReviewDate: Date
  },

  // ===== PERMISSIONS & ACCESS =====
  role: String,
  permissions: [String],  // ['view_clients', 'edit_applications', etc.]

  accessLevel: {
    type: String,
    enum: ['View Only', 'Editor', 'Manager', 'Administrator'],
    default: 'Editor'
  },

  canApprove: {
    applications: Boolean,
    documents: Boolean,
    teamMembers: Boolean
  },

  // ===== CONTACT INFORMATION =====
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // ===== DOCUMENTS =====
  documents: [{
    documentType: String,
    documentUrl: String,
    expiryDate: Date,
    verified: Boolean,
    verificationDate: Date
  }],

  // ===== ACTIVITY TRACKING =====
  lastLoginDate: Date,
  lastActivityDate: Date,
  
  activities: [{
    date: Date,
    action: String,
    details: String
  }],

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
  lastModifiedBy: mongoose.Schema.Types.ObjectId,
  
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// ===== INDEXES =====
teamMemberSchema.index({ tenantId: 1, consultancyId: 1 });
teamMemberSchema.index({ email: 1 });
teamMemberSchema.index({ employmentStatus: 1 });
teamMemberSchema.index({ role: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);

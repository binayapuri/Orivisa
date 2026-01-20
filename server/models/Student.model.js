// File: server/models/Student.model.js

const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, required: true },
    currentCountry: String,
    phone: String,
    whatsapp: String
  },
  
  passportInfo: {
    number: String,
    expiryDate: Date,
    issuingCountry: String
  },
  
  educationBackground: [{
    level: {
      type: String,
      enum: ['high_school', 'diploma', 'bachelor', 'master', 'phd']
    },
    institution: String,
    fieldOfStudy: String,
    country: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }]
  }],
  
  englishProficiency: {
    testType: {
      type: String,
      enum: ['IELTS', 'PTE', 'TOEFL', 'Duolingo', 'None']
    },
    overallScore: Number,
    reading: Number,
    writing: Number,
    listening: Number,
    speaking: Number,
    testDate: Date,
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }
  },
  
  workExperience: [{
    company: String,
    position: String,
    industry: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String
  }],
  
  preferences: {
    preferredCountries: [String],
    preferredCourses: [String],
    studyLevel: String,
    intakePreference: [String],
    budget: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'AUD' }
    }
  },
  
  currentVisa: {
    type: String,
    subclass: String,
    expiryDate: Date,
    conditions: String
  },
  
  // Assigned Agent
  assignedAgent: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    assignedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'terminated'],
      default: 'pending'
    }
  },
  
  // Rewards & Cashback
  totalCashback: {
    type: Number,
    default: 0
  },
  
  rewardPoints: {
    type: Number,
    default: 0
  },
  
  eligibilityStatus: {
    lastChecked: Date,
    results: mongoose.Schema.Types.Mixed
  },
  
  platformActivity: {
    lastActive: Date,
    applicationsCount: { type: Number, default: 0 },
    messagesCount: { type: Number, default: 0 }
  }
  
}, {
  timestamps: true
});

// Indexes
StudentSchema.index({ tenantId: 1, 'personalInfo.email': 1 });
StudentSchema.index({ 'assignedAgent.agentId': 1 });
StudentSchema.index({ 'preferences.preferredCountries': 1 });

module.exports = mongoose.model('Student', StudentSchema);

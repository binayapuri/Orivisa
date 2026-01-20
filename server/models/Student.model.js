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
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    nationality: String,
    countryOfResidence: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postcode: String,
      country: String
    }
  },
  
  passportDetails: {
    passportNumber: String,
    issueDate: Date,
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
    isCompleted: Boolean
  }],
  
  englishProficiency: {
    testType: {
      type: String,
      enum: ['IELTS', 'PTE', 'TOEFL', 'Duolingo', 'None']
    },
    overallScore: Number,
    listening: Number,
    reading: Number,
    writing: Number,
    speaking: Number,
    testDate: Date,
    expiryDate: Date
  },
  
  workExperience: [{
    jobTitle: String,
    company: String,
    country: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    isRelevantToNomination: Boolean
  }],
  
  currentVisa: {
    type: String,
    subclass: String,
    expiryDate: Date,
    conditions: [String]
  },
  
  preferences: {
    studyLevel: {
      type: String,
      enum: ['diploma', 'bachelor', 'master', 'phd']
    },
    preferredCountries: [String],
    preferredCourses: [String],
    intakePreference: [String],
    budget: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'AUD' }
    },
    goals: {
      type: String,
      enum: ['study', 'pr', 'work', 'family']
    }
  },
  
  assignedAgent: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    assignedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending'
    }
  },
  
  eligibilityStatus: {
    lastChecked: Date,
    results: mongoose.Schema.Types.Mixed
  },
  
  totalCashback: {
    type: Number,
    default: 0
  },
  
  rewardPoints: {
    type: Number,
    default: 0
  },
  
  platformActivity: {
    applicationsCount: { type: Number, default: 0 },
    lastActive: Date
  }
  
}, {
  timestamps: true
});

// Indexes
StudentSchema.index({ userId: 1 }, { unique: true });
StudentSchema.index({ tenantId: 1 });
StudentSchema.index({ 'assignedAgent.agentId': 1 });
StudentSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });

module.exports = mongoose.model('Student', StudentSchema);

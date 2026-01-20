// File: server/models/User.model.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  
  role: {
    type: String,
    enum: ['student', 'agent', 'college', 'insurance', 'admin'],
    required: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  lastLogin: Date,
  
  // Tenant Isolation Field
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      tenantId: this.tenantId 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Virtual populate based on role
UserSchema.virtual('profile', {
  ref: function() {
    const roleMap = {
      student: 'Student',
      agent: 'Agent',
      college: 'College',
      insurance: 'InsuranceProvider'
    };
    return roleMap[this.role];
  },
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

module.exports = mongoose.model('User', UserSchema);

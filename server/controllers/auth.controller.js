// File: server/controllers/auth.controller.js

const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');
const College = require('../models/College.model');
const InsuranceProvider = require('../models/InsuranceProvider.model');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const { generateTenantId } = require('../utils/helpers');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate tenant ID for new user
    const tenantId = generateTenantId();

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      tenantId,
      verificationToken: crypto.randomBytes(20).toString('hex'),
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Create role-specific profile
    let profile;
    switch (role) {
      case 'student':
        profile = await Student.create({
          userId: user._id,
          tenantId,
          personalInfo: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone
          }
        });
        break;

      case 'agent':
        profile = await Agent.create({
          userId: user._id,
          tenantId,
          consultancyId: profileData.consultancyId,
          personalInfo: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone
          },
          marnNumber: profileData.marnNumber,
          marnVerificationStatus: 'pending'
        });
        break;

      case 'college':
        profile = await College.create({
          userId: user._id,
          tenantId,
          institutionName: profileData.institutionName,
          cricos: profileData.cricos,
          contactInfo: {
            email,
            phone: profileData.phone
          }
        });
        break;

      case 'insurance':
        profile = await InsuranceProvider.create({
          userId: user._id,
          tenantId,
          companyName: profileData.companyName,
          abnNumber: profileData.abnNumber
        });
        break;
    }

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${user.verificationToken}`;
    await emailService.sendVerificationEmail(email, verificationUrl);

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.getSignedJwtToken();

    // Fetch profile based on role
    let profile;
    const profileModels = {
      student: Student,
      agent: Agent,
      college: College,
      insurance: InsuranceProvider
    };

    if (profileModels[user.role]) {
      profile = await profileModels[user.role].findOne({ userId: user._id });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        tenantId: user.tenantId
      },
      profile
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('profile');

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      message: 'Password reset successful',
      token
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;

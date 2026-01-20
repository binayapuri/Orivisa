// File: server/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');
const mongoose = require('mongoose');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, marnNumber } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate tenant ID
    const tenantId = new mongoose.Types.ObjectId();

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      tenantId
    });

    // Create role-specific profile
    let profile;
    
    if (role === 'student') {
      profile = await Student.create({
        userId: user._id,
        tenantId,
        personalInfo: {
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || ''
        }
      });
    } else if (role === 'agent') {
      if (!marnNumber) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'MARN number is required for agents'
        });
      }
      
      profile = await Agent.create({
        userId: user._id,
        tenantId,
        personalInfo: {
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || ''
        },
        marnNumber,
        marnVerificationStatus: 'pending'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Verify password
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

    // Get profile
    let profile;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'agent') {
      profile = await Agent.findOne({ userId: user._id });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      message: 'Login successful',
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const Student = require('../models/Student.model');
    const Agent = require('../models/Agent.model');

    let profile;
    
    if (req.user.role === 'student') {
      profile = await Student.findOne({ userId: req.user._id });
    } else if (req.user.role === 'agent') {
      profile = await Agent.findOne({ userId: req.user._id });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        tenantId: req.user.tenantId,
        lastLogin: req.user.lastLogin
      },
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;

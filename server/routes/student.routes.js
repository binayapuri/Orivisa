// File: server/routes/student.routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize, tenantIsolation } = require('../middleware/auth.middleware');
const Student = require('../models/Student.model');
const User = require('../models/User.model');

// All routes require authentication
router.use(protect);
router.use(authorize('student', 'agent', 'admin'));
router.use(tenantIsolation);

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student)
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findOne({ 
      userId: req.user._id,
      tenantId: req.tenantId 
    }).populate('assignedAgent.agentId', 'personalInfo marnNumber');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
router.put('/profile', async (req, res) => {
  try {
    const {
      personalInfo,
      passportDetails,
      educationBackground,
      englishProficiency,
      workExperience,
      currentVisa,
      preferences
    } = req.body;

    const student = await Student.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update fields
    if (personalInfo) student.personalInfo = { ...student.personalInfo, ...personalInfo };
    if (passportDetails) student.passportDetails = { ...student.passportDetails, ...passportDetails };
    if (educationBackground) student.educationBackground = educationBackground;
    if (englishProficiency) student.englishProficiency = { ...student.englishProficiency, ...englishProficiency };
    if (workExperience) student.workExperience = workExperience;
    if (currentVisa) student.currentVisa = { ...student.currentVisa, ...currentVisa };
    if (preferences) student.preferences = { ...student.preferences, ...preferences };

    await student.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Add education record
// @route   POST /api/students/education
// @access  Private (Student)
router.post('/education', async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    student.educationBackground.push(req.body);
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Education record added',
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Add work experience
// @route   POST /api/students/work-experience
// @access  Private (Student)
router.post('/work-experience', async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    student.workExperience.push(req.body);
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Work experience added',
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get student dashboard stats
// @route   GET /api/students/dashboard
// @access  Private (Student)
router.get('/dashboard', async (req, res) => {
  try {
    const Application = require('../models/Application.model');
    
    const student = await Student.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    }).populate('assignedAgent.agentId', 'personalInfo marnNumber');

    const applications = await Application.find({
      studentId: student._id,
      tenantId: req.tenantId
    }).sort({ createdAt: -1 }).limit(5);

    const stats = {
      totalApplications: student.platformActivity.applicationsCount,
      activeApplications: await Application.countDocuments({
        studentId: student._id,
        status: { $in: ['draft', 'documents_pending', 'ready_for_submission'] }
      }),
      completedApplications: await Application.countDocuments({
        studentId: student._id,
        status: 'completed'
      }),
      totalCashback: student.totalCashback,
      rewardPoints: student.rewardPoints
    };

    res.json({
      success: true,
      student: {
        name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
        email: req.user.email,
        assignedAgent: student.assignedAgent
      },
      stats,
      recentApplications: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

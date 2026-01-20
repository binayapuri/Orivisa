// File: server/routes/agent.routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize, tenantIsolation } = require('../middleware/auth.middleware');
const Agent = require('../models/Agent.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');

// All routes require authentication
router.use(protect);
router.use(authorize('agent', 'admin'));
router.use(tenantIsolation);

// @desc    Get agent profile
// @route   GET /api/agents/profile
// @access  Private (Agent)
router.get('/profile', async (req, res) => {
  try {
    const agent = await Agent.findOne({ 
      userId: req.user._id,
      tenantId: req.tenantId 
    }).populate('consultancyId', 'name address');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update agent profile
// @route   PUT /api/agents/profile
// @access  Private (Agent)
router.put('/profile', async (req, res) => {
  try {
    const {
      personalInfo,
      specializations,
      languages,
      bankDetails
    } = req.body;

    const agent = await Agent.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    // Update fields
    if (personalInfo) agent.personalInfo = { ...agent.personalInfo, ...personalInfo };
    if (specializations) agent.specializations = specializations;
    if (languages) agent.languages = languages;
    if (bankDetails) agent.bankDetails = { ...agent.bankDetails, ...bankDetails };

    await agent.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get agent dashboard stats
// @route   GET /api/agents/dashboard
// @access  Private (Agent)
router.get('/dashboard', async (req, res) => {
  try {
    const agent = await Agent.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    // Get application stats
    const totalApplications = await Application.countDocuments({
      agentId: agent._id,
      tenantId: req.tenantId
    });

    const activeApplications = await Application.countDocuments({
      agentId: agent._id,
      tenantId: req.tenantId,
      status: { 
        $in: ['draft', 'form956_pending', 'documents_pending', 'ready_for_submission', 'submitted_to_college']
      }
    });

    const completedApplications = await Application.countDocuments({
      agentId: agent._id,
      tenantId: req.tenantId,
      status: 'completed'
    });

    const visaGranted = await Application.countDocuments({
      agentId: agent._id,
      tenantId: req.tenantId,
      status: 'visa_granted'
    });

    // Get recent applications
    const recentApplications = await Application.find({
      agentId: agent._id,
      tenantId: req.tenantId
    })
    .populate('studentId', 'personalInfo')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate success rate
    const successRate = completedApplications > 0 
      ? ((visaGranted / completedApplications) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      agent: {
        name: `${agent.personalInfo.firstName} ${agent.personalInfo.lastName}`,
        marnNumber: agent.marnNumber,
        marnStatus: agent.marnVerificationStatus,
        subscriptionTier: agent.subscriptionTier
      },
      stats: {
        totalClients: agent.metrics.totalClients,
        totalApplications,
        activeApplications,
        completedApplications,
        visaGranted,
        successRate: parseFloat(successRate),
        totalCommissions: agent.metrics.totalCommissionsEarned,
        averageRating: agent.metrics.averageRating
      },
      recentApplications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get agent's clients
// @route   GET /api/agents/clients
// @access  Private (Agent)
router.get('/clients', async (req, res) => {
  try {
    const agent = await Agent.findOne({
      userId: req.user._id,
      tenantId: req.tenantId
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    const clients = await Student.find({
      'assignedAgent.agentId': agent._id,
      tenantId: req.tenantId
    }).select('personalInfo currentVisa platformActivity assignedAgent');

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Verify MARN (simulate OMARA check)
// @route   POST /api/agents/verify-marn
// @access  Private (Admin)
router.post('/verify-marn/:agentId', authorize('admin'), async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Simulate OMARA verification
    agent.marnVerificationStatus = 'verified';
    agent.marnVerifiedAt = new Date();
    agent.lastOMARACheck = new Date();
    agent.marnExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await agent.save();

    res.json({
      success: true,
      message: 'MARN verified successfully',
      agent: {
        marnNumber: agent.marnNumber,
        status: agent.marnVerificationStatus,
        verifiedAt: agent.marnVerifiedAt,
        expiryDate: agent.marnExpiryDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

// File: server/controllers/agent.controller.js

const Agent = require('../models/Agent.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const Lead = require('../models/Lead.model');
const Commission = require('../models/Commission.model');
const omaraService = require('../services/omara.service');

// @desc    Get agent profile
// @route   GET /api/agents/profile
// @access  Private/Agent
exports.getAgentProfile = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id })
      .populate('consultancyId');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    res.json({
      success: true,
      data: agent
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify MARN number
// @route   POST /api/agents/verify-marn
// @access  Private/Agent
exports.verifyMARN = async (req, res, next) => {
  try {
    const { marnNumber } = req.body;

    // Call OMARA API to verify
    const verification = await omaraService.verifyMARN(marnNumber);

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MARN number or registration expired',
        details: verification
      });
    }

    const agent = await Agent.findOne({ userId: req.user.id });

    agent.marnNumber = marnNumber;
    agent.marnVerificationStatus = 'verified';
    agent.marnVerifiedAt = Date.now();
    agent.marnExpiryDate = verification.expiryDate;
    agent.lastOMARACheck = Date.now();

    await agent.save();

    res.json({
      success: true,
      message: 'MARN verified successfully',
      data: {
        marnNumber,
        verifiedAt: agent.marnVerifiedAt,
        expiryDate: agent.marnExpiryDate
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get leads
// @route   GET /api/agents/leads
// @access  Private/Agent
exports.getLeads = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const query = { 
      agentId: agent._id,
      status
    };

    const leads = await Lead.find(query)
      .populate('studentId', 'personalInfo preferences eligibilityStatus')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt')
      .exec();

    const count = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: leads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Accept lead
// @route   POST /api/agents/leads/:id/accept
// @access  Private/Agent
exports.acceptLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead.status = 'accepted';
    lead.respondedAt = Date.now();
    await lead.save();

    // Update student assignment
    await Student.findByIdAndUpdate(lead.studentId, {
      'assignedAgent.status': 'active'
    });

    // Update agent metrics
    const agent = await Agent.findOne({ userId: req.user.id });
    agent.metrics.totalClients += 1;
    await agent.save();

    res.json({
      success: true,
      message: 'Lead accepted successfully',
      data: lead
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get clients
// @route   GET /api/agents/clients
// @access  Private/Agent
exports.getClients = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    const clients = await Student.find({
      'assignedAgent.agentId': agent._id,
      'assignedAgent.status': 'active'
    }).select('personalInfo preferences educationBackground englishProficiency');

    res.json({
      success: true,
      data: clients,
      count: clients.length
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get applications
// @route   GET /api/agents/applications
// @access  Private/Agent
exports.getApplications = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    const { status, page = 1, limit = 50 } = req.query;

    const query = { agentId: agent._id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('studentId', 'personalInfo')
      .populate('collegeId', 'institutionName')
      .populate('form956Id')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt')
      .exec();

    const count = await Application.countDocuments(query);

    // Group by status for Kanban board
    const grouped = {
      draft: [],
      form956_pending: [],
      documents_pending: [],
      ready_for_submission: [],
      submitted_to_college: [],
      offer_received: [],
      visa_lodged: [],
      completed: []
    };

    applications.forEach(app => {
      if (grouped[app.status]) {
        grouped[app.status].push(app);
      }
    });

    res.json({
      success: true,
      data: applications,
      grouped,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create application
// @route   POST /api/agents/applications
// @access  Private/Agent
exports.createApplication = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    const {
      studentId,
      collegeId,
      programDetails
    } = req.body;

    // Verify student is assigned to this agent
    const student = await Student.findOne({
      _id: studentId,
      'assignedAgent.agentId': agent._id
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create applications for this student'
      });
    }

    const application = await Application.create({
      tenantId: req.tenantId,
      studentId,
      agentId: agent._id,
      collegeId,
      consultancyId: agent.consultancyId,
      programDetails,
      status: 'draft'
    });

    // Update metrics
    agent.metrics.activeApplications += 1;
    await agent.save();

    student.platformActivity.applicationsCount += 1;
    await student.save();

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application created successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get commissions
// @route   GET /api/agents/commissions
// @access  Private/Agent
exports.getCommissions = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    const commissions = await Commission.find({
      'distribution.agent.agentId': agent._id
    })
    .populate('applicationId', 'applicationRef studentId')
    .sort('-createdAt');

    const summary = {
      totalEarned: agent.metrics.totalCommissionsEarned,
      pending: 0,
      paid: 0,
      thisMonth: 0
    };

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    commissions.forEach(c => {
      const amount = c.distribution.agent.amount;

      if (c.paymentStatus === 'pending') summary.pending += amount;
      if (c.paymentStatus === 'paid') summary.paid += amount;

      if (c.createdAt >= monthStart) summary.thisMonth += amount;
    });

    res.json({
      success: true,
      data: commissions,
      summary
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/agents/analytics
// @access  Private/Agent
exports.getAnalytics = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });

    const applications = await Application.find({ agentId: agent._id });

    const analytics = {
      overview: {
        totalClients: agent.metrics.totalClients,
        activeApplications: agent.metrics.activeApplications,
        completedApplications: agent.metrics.completedApplications,
        successRate: agent.metrics.successRate,
        averageRating: agent.metrics.averageRating
      },
      statusBreakdown: {},
      monthlyTrend: [],
      topColleges: []
    };

    // Status breakdown
    applications.forEach(app => {
      analytics.statusBreakdown[app.status] = 
        (analytics.statusBreakdown[app.status] || 0) + 1;
    });

    // Calculate success rate
    const completed = applications.filter(a => 
      ['visa_granted', 'completed'].includes(a.status)
    ).length;
    const total = applications.filter(a => 
      !['draft', 'withdrawn'].includes(a.status)
    ).length;

    agent.metrics.successRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    await agent.save();

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;

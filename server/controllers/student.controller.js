// File: server/controllers/student.controller.js

const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');
const College = require('../models/College.model');
const Application = require('../models/Application.model');
const Lead = require('../models/Lead.model');
const eligibilityService = require('../services/eligibility.service');
const matchingService = require('../services/matching.service');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
exports.getStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id })
      .populate('assignedAgent.agentId');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private/Student
exports.updateStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Check eligibility for programs
// @route   POST /api/students/eligibility/check
// @access  Private/Student
exports.checkEligibility = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    // Run eligibility checker
    const results = await eligibilityService.checkEligibility({
      academicBackground: student.educationBackground,
      englishTest: student.englishProficiency,
      workExperience: student.workExperience,
      preferences: student.preferences,
      currentVisa: student.currentVisa
    });

    // Update student record
    student.eligibilityStatus = {
      lastChecked: Date.now(),
      results
    };
    await student.save();

    res.json({
      success: true,
      data: results,
      message: 'Eligibility check completed'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Search colleges
// @route   GET /api/students/colleges/search
// @access  Private/Student
exports.searchColleges = async (req, res, next) => {
  try {
    const {
      country,
      studyLevel,
      fieldOfStudy,
      intake,
      minBudget,
      maxBudget,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    if (country) query.country = country;
    if (studyLevel) query['programs.level'] = studyLevel;
    if (fieldOfStudy) query['programs.fieldOfStudy'] = new RegExp(fieldOfStudy, 'i');

    const colleges = await College.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await College.countDocuments(query);

    res.json({
      success: true,
      data: colleges,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Search agents
// @route   GET /api/students/agents/search
// @access  Private/Student
exports.searchAgents = async (req, res, next) => {
  try {
    const {
      specialization,
      language,
      minRating,
      state,
      page = 1,
      limit = 20
    } = req.query;

    const query = {
      marnVerificationStatus: 'verified',
      subscriptionStatus: 'active',
      'metrics.averageRating': { $gte: minRating || 0 }
    };

    if (specialization) query.specializations = specialization;
    if (language) query.languages = language;
    if (state) query['personalInfo.state'] = state;

    const agents = await Agent.find(query)
      .populate('consultancyId', 'name website')
      .select('personalInfo marnNumber specializations languages metrics')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-metrics.averageRating')
      .exec();

    const count = await Agent.countDocuments(query);

    res.json({
      success: true,
      data: agents,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Assign agent
// @route   POST /api/students/agents/assign
// @access  Private/Student
exports.assignAgent = async (req, res, next) => {
  try {
    const { agentId, message } = req.body;

    const student = await Student.findOne({ userId: req.user.id });
    const agent = await Agent.findById(agentId);

    if (!agent || agent.subscriptionStatus !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Agent not available'
      });
    }

    // Create lead for agent
    const lead = await Lead.create({
      tenantId: req.tenantId,
      studentId: student._id,
      agentId: agent._id,
      status: 'pending',
      studentMessage: message,
      source: 'platform_search'
    });

    // Update student
    student.assignedAgent = {
      agentId: agent._id,
      assignedAt: Date.now(),
      status: 'pending'
    };
    await student.save();

    // Send notification to agent
    // await notificationService.notifyNewLead(agent, student, lead);

    res.json({
      success: true,
      data: lead,
      message: 'Request sent to agent. They will contact you soon.'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications
// @route   GET /api/students/applications
// @access  Private/Student
exports.getMyApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    const applications = await Application.find({ studentId: student._id })
      .populate('agentId', 'personalInfo marnNumber')
      .populate('collegeId', 'institutionName location')
      .populate('form956Id')
      .sort('-createdAt');

    res.json({
      success: true,
      data: applications,
      count: applications.length
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get rewards and cashback
// @route   GET /api/students/rewards
// @access  Private/Student
exports.getRewards = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    const commissions = await require('../models/Commission.model').find({
      'distribution.student.studentId': student._id,
      paymentStatus: { $in: ['pending', 'paid'] }
    });

    const totalEarned = commissions.reduce((sum, c) => 
      sum + c.distribution.student.amount, 0
    );

    const pendingPayouts = commissions
      .filter(c => c.paymentStatus === 'pending')
      .reduce((sum, c) => sum + c.distribution.student.amount, 0);

    res.json({
      success: true,
      data: {
        totalCashback: student.totalCashback,
        rewardPoints: student.rewardPoints,
        totalEarned,
        pendingPayouts,
        availableForWithdrawal: student.totalCashback,
        history: commissions
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw cashback
// @route   POST /api/students/rewards/withdraw
// @access  Private/Student
exports.withdrawCashback = async (req, res, next) => {
  try {
    const { amount, bankDetails } = req.body;

    const student = await Student.findOne({ userId: req.user.id });

    if (amount > student.totalCashback) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is $50'
      });
    }

    // Process payout
    // const payout = await stripeService.createPayout(bankDetails, amount);

    student.totalCashback -= amount;
    await student.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted. Funds will be transferred within 3-5 business days.',
      remainingBalance: student.totalCashback
    });

  } catch (error) {
    next(error);
  }
};

module.exports = exports;

// File: server/routes/application.routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize, tenantIsolation } = require('../middleware/auth.middleware');
const Application = require('../models/Application.model');
const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');
const mongoose = require('mongoose');

router.use(protect);
router.use(tenantIsolation);

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Agent, Student)
router.post('/', authorize('agent', 'student', 'admin'), async (req, res) => {
  try {
    const {
      studentId,
      programDetails,
      visaDetails
    } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get agent info
    let agentId;
    if (req.user.role === 'agent') {
      const agent = await Agent.findOne({ userId: req.user._id });
      agentId = agent._id;
    } else if (req.user.role === 'student') {
      // If student is creating, use their assigned agent
      if (student.assignedAgent && student.assignedAgent.agentId) {
        agentId = student.assignedAgent.agentId;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No agent assigned to student'
        });
      }
    }

    // Create application
    const application = await Application.create({
      tenantId: req.tenantId,
      studentId,
      agentId,
      programDetails,
      visaDetails,
      status: 'draft',
      workflow: {
        currentStage: 'Information Collection',
        stages: [{
          name: 'Information Collection',
          status: 'in_progress',
          completedAt: null
        }]
      },
      timeline: [{
        event: 'Application Created',
        description: 'Application draft created',
        performedBy: req.user._id
      }]
    });

    // Update student's application count
    student.platformActivity.applicationsCount += 1;
    await student.save();

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all applications (with filters)
// @route   GET /api/applications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, studentId, agentId } = req.query;

    let query = { tenantId: req.tenantId };

    // Role-based filtering
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      query.studentId = student._id;
    } else if (req.user.role === 'agent') {
      const agent = await Agent.findOne({ userId: req.user._id });
      query.agentId = agent._id;
    }

    // Additional filters
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;
    if (agentId) query.agentId = agentId;

    const applications = await Application.find(query)
      .populate('studentId', 'personalInfo')
      .populate('agentId', 'personalInfo marnNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    })
    .populate('studentId')
    .populate('agentId', 'personalInfo marnNumber')
    .populate('collegeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check access rights
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (application.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (req.user.role === 'agent') {
      const agent = await Agent.findOne({ userId: req.user._id });
      if (application.agentId._id.toString() !== agent._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update application status (Kanban board)
// @route   PUT /api/applications/:id/status
// @access  Private (Agent, Admin)
router.put('/:id/status', authorize('agent', 'admin'), async (req, res) => {
  try {
    const { status, note } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Validate status transition (basic workflow rules)
    const validStatuses = [
      'draft',
      'form956_pending',
      'form956_signed',
      'documents_pending',
      'ready_for_submission',
      'submitted_to_college',
      'offer_received',
      'coe_received',
      'visa_lodged',
      'visa_granted',
      'visa_refused',
      'completed',
      'withdrawn'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update status
    const oldStatus = application.status;
    application.status = status;

    // Add to timeline
    application.timeline.push({
      event: `Status Changed`,
      description: `Status changed from ${oldStatus} to ${status}`,
      performedBy: req.user._id
    });

    // Add note if provided
    if (note) {
      application.notes.push({
        content: note,
        createdBy: req.user._id,
        isPrivate: false
      });
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Add note to application
// @route   POST /api/applications/:id/notes
// @access  Private
router.post('/:id/notes', async (req, res) => {
  try {
    const { content, isPrivate } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.notes.push({
      content,
      createdBy: req.user._id,
      isPrivate: isPrivate || false
    });

    await application.save();

    res.json({
      success: true,
      message: 'Note added',
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get applications by status (Kanban columns)
// @route   GET /api/applications/kanban/board
// @access  Private (Agent, Admin)
router.get('/kanban/board', authorize('agent', 'admin'), async (req, res) => {
  try {
    const agent = await Agent.findOne({ userId: req.user._id });

    const columns = [
      'draft',
      'form956_pending',
      'documents_pending',
      'ready_for_submission',
      'submitted_to_college',
      'offer_received',
      'coe_received',
      'visa_lodged',
      'visa_granted'
    ];

    const board = {};

    for (const status of columns) {
      const applications = await Application.find({
        agentId: agent._id,
        tenantId: req.tenantId,
        status
      })
      .populate('studentId', 'personalInfo')
      .sort({ createdAt: -1 });

      board[status] = applications;
    }

    res.json({
      success: true,
      board
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

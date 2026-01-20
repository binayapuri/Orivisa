// File: server/controllers/commission.controller.js

const Commission = require('../models/Commission.model');
const Application = require('../models/Application.model');
const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');
const stripeService = require('../services/stripe.service');

// @desc    Calculate and distribute commission
// @route   POST /api/commissions/calculate
// @access  Private (Admin/System)
exports.calculateCommission = async (req, res, next) => {
  try {
    const { applicationId, sourceType, totalAmount } = req.body;
    
    const application = await Application.findById(applicationId)
      .populate('studentId')
      .populate('agentId')
      .populate('collegeId');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Commission rates from environment
    const platformRate = parseFloat(process.env.PLATFORM_COMMISSION) / 100;
    const agentRate = parseFloat(process.env.AGENT_COMMISSION) / 100;
    const studentCashbackRate = parseFloat(process.env.STUDENT_CASHBACK) / 100;
    
    // Calculate distribution
    const platformAmount = totalAmount * platformRate;
    const agentAmount = totalAmount * agentRate;
    const studentCashback = totalAmount * studentCashbackRate;
    
    // Create commission record
    const commission = await Commission.create({
      tenantId: req.tenantId,
      applicationId,
      sourceType,
      sourceId: application.collegeId._id,
      totalCommissionAmount: totalAmount,
      distribution: {
        platform: {
          percentage: platformRate * 100,
          amount: platformAmount
        },
        agent: {
          agentId: application.agentId._id,
          percentage: agentRate * 100,
          amount: agentAmount
        },
        student: {
          studentId: application.studentId._id,
          percentage: studentCashbackRate * 100,
          amount: studentCashback
        }
      },
      triggeredBy: 'enrollment_confirmed',
      triggeredAt: new Date()
    });
    
    // Update application
    application.commissions = {
      collegeCommissionAmount: totalAmount,
      platformShare: platformAmount,
      agentShare: agentAmount,
      studentCashback
    };
    await application.save();
    
    // Update student cashback balance
    await Student.findByIdAndUpdate(application.studentId._id, {
      $inc: { totalCashback: studentCashback }
    });
    
    // Update agent earnings
    await Agent.findByIdAndUpdate(application.agentId._id, {
      $inc: { 'metrics.totalCommissionsEarned': agentAmount }
    });
    
    res.json({
      success: true,
      data: commission,
      message: 'Commission calculated and distributed successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Process payout to agent
// @route   POST /api/commissions/:id/payout/agent
// @access  Private (Admin)
exports.payoutToAgent = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate('distribution.agent.agentId');
    
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }
    
    const agent = commission.distribution.agent.agentId;
    const amount = commission.distribution.agent.amount;
    
    // Process Stripe transfer or bank payout
    const transfer = await stripeService.createPayout(
      agent.bankDetails.accountNumber,
      amount,
      'Agent commission payout'
    );
    
    // Record payout
    commission.payouts.push({
      recipientType: 'agent',
      recipientId: agent.userId,
      amount,
      status: 'paid',
      paidAt: new Date(),
      paymentMethod: 'bank_transfer',
      transactionId: transfer.id
    });
    
    // Check if all payouts complete
    if (commission.payouts.length === 3) {
      commission.paymentStatus = 'paid';
    }
    
    await commission.save();
    
    res.json({
      success: true,
      data: commission,
      message: 'Payout processed successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

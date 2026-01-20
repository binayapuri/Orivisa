// File: server/controllers/form956.controller.js

const Form956 = require('../models/Form956.model');
const Application = require('../models/Application.model');
const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');
const pdfService = require('../services/pdf.service');
const s3Service = require('../services/s3.service');

// @desc    Generate Form 956
// @route   POST /api/form956/generate
// @access  Private (Agent only)
exports.generateForm956 = async (req, res, next) => {
  try {
    const { applicationId } = req.body;
    
    // Validate application exists and agent has access
    const application = await Application.findOne({
      _id: applicationId,
      agentId: req.user.id,
      tenantId: req.tenantId
    }).populate('studentId').populate('agentId');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or access denied'
      });
    }
    
    // Check if Form 956 already exists
    let form956 = await Form956.findOne({ applicationId });
    
    if (form956) {
      return res.status(400).json({
        success: false,
        message: 'Form 956 already exists for this application',
        formId: form956._id
      });
    }
    
    // Create new Form 956
    form956 = await Form956.create({
      tenantId: req.tenantId,
      studentId: application.studentId._id,
      agentId: application.agentId._id,
      applicationId: application._id,
      formData: {
        applicant: {
          familyName: application.studentId.personalInfo.lastName,
          givenNames: application.studentId.personalInfo.firstName,
          dateOfBirth: application.studentId.personalInfo.dateOfBirth,
          passportNumber: application.studentId.passportInfo.number,
          email: req.user.email,
          // ... other fields
        },
        authorizedRep: {
          marnNumber: application.agentId.marnNumber,
          firstName: application.agentId.personalInfo.firstName,
          lastName: application.agentId.personalInfo.lastName,
          // ... other fields
        },
        scopeOfAuthority: {
          visaTypes: ['Student Visa (Subclass 500)'],
          canReceiveCorrespondence: true,
          canActOnBehalf: true,
          canWithdrawApplication: false
        },
        consumerGuideProvided: true,
        consumerGuideProvidedDate: new Date(),
        studentConsent: false // Will be set when student signs
      },
      status: 'pending_student_signature'
    });
    
    // Update application reference
    application.form956Id = form956._id;
    await application.save();
    
    res.status(201).json({
      success: true,
      data: form956,
      message: 'Form 956 generated successfully. Awaiting student signature.'
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Student signs Form 956
// @route   POST /api/form956/:id/sign/student
// @access  Private (Student only)
exports.studentSignForm = async (req, res, next) => {
  try {
    const { signatureData } = req.body;
    
    const form956 = await Form956.findOne({
      _id: req.params.id,
      studentId: req.user.id,
      tenantId: req.tenantId
    });
    
    if (!form956) {
      return res.status(404).json({
        success: false,
        message: 'Form 956 not found'
      });
    }
    
    if (form956.status !== 'pending_student_signature') {
      return res.status(400).json({
        success: false,
        message: 'Form is not awaiting student signature'
      });
    }
    
    // Record signature
    form956.signatures.student = {
      signedAt: new Date(),
      ipAddress: req.ip,
      signatureData,
      isSigned: true
    };
    
    form956.formData.studentConsent = true;
    form956.formData.consentTimestamp = new Date();
    form956.formData.consentIPAddress = req.ip;
    
    form956.status = 'pending_agent_signature';
    
    await form956.save();
    
    // Notify agent
    // await notificationService.notify(...)
    
    res.json({
      success: true,
      data: form956,
      message: 'Form 956 signed successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Generate PDF and submit to DHA
// @route   POST /api/form956/:id/submit
// @access  Private (Agent only)
exports.submitFormToDHA = async (req, res, next) => {
  try {
    const form956 = await Form956.findOne({
      _id: req.params.id,
      agentId: req.user.id,
      tenantId: req.tenantId
    }).populate('studentId').populate('agentId');
    
    if (!form956) {
      return res.status(404).json({
        success: false,
        message: 'Form 956 not found'
      });
    }
    
    if (!form956.signatures.student.isSigned || !form956.signatures.agent.isSigned) {
      return res.status(400).json({
        success: false,
        message: 'Both parties must sign before submission'
      });
    }
    
    // Generate PDF
    const pdfBuffer = await pdfService.generateForm956PDF(form956);
    
    // Upload to S3
    const s3Key = `form956/${form956.formReference}.pdf`;
    await s3Service.uploadFile(pdfBuffer, s3Key, 'application/pdf');
    
    form956.pdfDocument = {
      s3Key,
      s3Bucket: process.env.AWS_S3_BUCKET,
      generatedAt: new Date()
    };
    
    form956.status = 'completed';
    form956.dhaSubmission = {
      submittedAt: new Date(),
      submissionMethod: 'platform'
    };
    
    await form956.save();
    
    // Update application status
    await Application.findByIdAndUpdate(form956.applicationId, {
      status: 'form956_signed',
      'timeline.form956Signed': new Date()
    });
    
    res.json({
      success: true,
      data: form956,
      pdfUrl: await s3Service.getSignedUrl(s3Key),
      message: 'Form 956 completed and ready for DHA submission'
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

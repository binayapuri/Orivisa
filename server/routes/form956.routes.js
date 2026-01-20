// File: server/routes/form956.routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize, tenantIsolation } = require('../middleware/auth.middleware');
const Form956 = require('../models/Form956.model');
const Application = require('../models/Application.model');
const Student = require('../models/Student.model');
const Agent = require('../models/Agent.model');

router.use(protect);
router.use(tenantIsolation);

// @desc    Create Form 956
// @route   POST /api/form956
// @access  Private (Agent)
router.post('/', authorize('agent', 'admin'), async (req, res) => {
  try {
    const { applicationId } = req.body;

    // Get application with populated data
    const application = await Application.findOne({
      _id: applicationId,
      tenantId: req.tenantId
    }).populate('studentId').populate('agentId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if Form 956 already exists
    const existingForm = await Form956.findOne({ applicationId });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        message: 'Form 956 already exists for this application',
        form956: existingForm
      });
    }

    const student = application.studentId;
    const agent = application.agentId;

    // Create Form 956 with pre-filled data
    const form956 = await Form956.create({
      tenantId: req.tenantId,
      applicationId: application._id,
      studentId: student._id,
      agentId: agent._id,
      
      applicantDetails: {
        familyName: student.personalInfo.lastName || '',
        givenNames: student.personalInfo.firstName || '',
        dateOfBirth: student.personalInfo.dateOfBirth,
        sex: student.personalInfo.gender,
        countryOfBirth: student.personalInfo.nationality,
        passport: {
          number: student.passportDetails?.passportNumber,
          country: student.passportDetails?.issuingCountry,
          expiryDate: student.passportDetails?.expiryDate
        },
        currentAddress: student.personalInfo.address || {},
        contactDetails: {
          phone: student.personalInfo.phone,
          email: req.user.email
        }
      },
      
      authorisedRecipient: {
        isAuthorised: true,
        marnNumber: agent.marnNumber,
        fullName: `${agent.personalInfo.firstName} ${agent.personalInfo.lastName}`,
        businessName: agent.personalInfo.businessName || '',
        address: {
          street: agent.personalInfo.officeAddress || '',
          suburb: agent.personalInfo.city || '',
          state: agent.personalInfo.state || '',
          postcode: agent.personalInfo.postcode || '',
          country: 'Australia'
        },
        contactDetails: {
          phone: agent.personalInfo.phone,
          email: req.user.email
        }
      },
      
      migrationAgent: {
        marnNumber: agent.marnNumber,
        fullName: `${agent.personalInfo.firstName} ${agent.personalInfo.lastName}`,
        businessName: agent.personalInfo.businessName || '',
        address: {
          street: agent.personalInfo.officeAddress || '',
          suburb: agent.personalInfo.city || '',
          state: agent.personalInfo.state || '',
          postcode: agent.personalInfo.postcode || '',
          country: 'Australia'
        },
        contactDetails: {
          phone: agent.personalInfo.phone,
          email: req.user.email
        }
      },
      
      status: 'pending_signature',
      
      auditTrail: [{
        action: 'Form Created',
        performedBy: req.user._id,
        details: 'Form 956 generated from application'
      }]
    });

    // Update application
    application.form956Id = form956._id;
    application.status = 'form956_pending';
    application.timeline.push({
      event: 'Form 956 Generated',
      description: `Form 956 (${form956.form956Ref}) created and awaiting signature`,
      performedBy: req.user._id
    });
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Form 956 created successfully',
      form956
    });

  } catch (error) {
    console.error('Error creating Form 956:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get Form 956 by ID (Debug version - no tenant check initially)
// @route   GET /api/form956/debug/:id
// @access  Private
router.get('/debug/:id', async (req, res) => {
  try {
    const form956 = await Form956.findById(req.params.id);
    
    if (!form956) {
      return res.json({
        success: false,
        message: 'Form not found in database',
        searchedId: req.params.id
      });
    }

    res.json({
      success: true,
      form956: {
        id: form956._id,
        ref: form956.form956Ref,
        tenantId: form956.tenantId,
        studentId: form956.studentId,
        agentId: form956.agentId,
        status: form956.status
      },
      requestInfo: {
        yourTenantId: req.tenantId,
        yourUserId: req.user._id,
        tenantMatch: form956.tenantId.toString() === req.tenantId.toString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get Form 956 by ID
// @route   GET /api/form956/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const form956 = await Form956.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    })
    .populate('studentId', 'personalInfo')
    .populate('agentId', 'personalInfo marnNumber')
    .populate('applicationId');

    if (!form956) {
      return res.status(404).json({
        success: false,
        message: 'Form 956 not found'
      });
    }

    res.json({
      success: true,
      form956
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Sign Form 956 (Digital Signature)
// @route   POST /api/form956/:id/sign
// @access  Private
router.post('/:id/sign', async (req, res) => {
  try {
    const { signerType, signature, fullName } = req.body;

    console.log('🖊️  Signing attempt:', {
      formId: req.params.id,
      signerType,
      userId: req.user._id,
      tenantId: req.tenantId
    });

    // Find form WITHOUT tenant isolation first for debugging
    const form956 = await Form956.findById(req.params.id);

    if (!form956) {
      console.log('❌ Form not found in database');
      return res.status(404).json({
        success: false,
        message: 'Form 956 not found in database'
      });
    }

    console.log('✅ Form found:', form956.form956Ref);

    // Check tenant match
    if (form956.tenantId.toString() !== req.tenantId.toString()) {
      console.log('❌ Tenant mismatch:', {
        formTenant: form956.tenantId,
        userTenant: req.tenantId
      });
      return res.status(403).json({
        success: false,
        message: 'Access denied - tenant mismatch'
      });
    }

    // Validate signer based on type
    if (signerType === 'applicant') {
      const student = await Student.findOne({ userId: req.user._id });
      
      console.log('👨‍🎓 Student check:', {
        studentId: student?._id,
        form956StudentId: form956.studentId,
        match: student?._id.toString() === form956.studentId.toString()
      });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      if (student._id.toString() !== form956.studentId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the applicant can sign this section',
          debug: {
            yourStudentId: student._id,
            formStudentId: form956.studentId
          }
        });
      }

      form956.signatures.applicant = {
        name: fullName,
        signedAt: new Date(),
        ipAddress: req.ip,
        signature: signature,
        isSigned: true
      };

      form956.consent.providesConsent = true;
      form956.consent.understandsRole = true;
      form956.consent.authorisesRepresentation = true;
      form956.consent.agreesToTerms = true;

      console.log('✅ Applicant signature added');

    } else if (signerType === 'agent') {
      const agent = await Agent.findOne({ userId: req.user._id });
      
      console.log('👔 Agent check:', {
        agentId: agent?._id,
        form956AgentId: form956.agentId,
        match: agent?._id.toString() === form956.agentId.toString()
      });
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent profile not found'
        });
      }

      if (agent._id.toString() !== form956.agentId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned agent can sign this section',
          debug: {
            yourAgentId: agent._id,
            formAgentId: form956.agentId
          }
        });
      }

      form956.signatures.agent = {
        name: fullName,
        marnNumber: agent.marnNumber,
        signedAt: new Date(),
        signature: signature,
        isSigned: true
      };

      console.log('✅ Agent signature added');

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid signer type. Must be "applicant" or "agent"'
      });
    }

    // Check if all signatures complete
    const allSigned = form956.signatures.applicant?.isSigned && form956.signatures.agent?.isSigned;

    if (allSigned) {
      form956.status = 'signed';
      console.log('🎉 All signatures complete!');
      
      // Update application
      const application = await Application.findById(form956.applicationId);
      if (application) {
        application.status = 'form956_signed';
        application.timeline.push({
          event: 'Form 956 Signed',
          description: 'All parties have signed Form 956',
          performedBy: req.user._id
        });
        await application.save();
        console.log('✅ Application status updated');
      }
    }

    // Add to audit trail
    form956.auditTrail.push({
      action: `${signerType} Signature Added`,
      performedBy: req.user._id,
      details: `${fullName} signed the form as ${signerType}`
    });

    await form956.save();
    console.log('✅ Form 956 saved successfully');

    res.json({
      success: true,
      message: 'Signature added successfully',
      form956,
      allSigned,
      signatures: {
        applicant: form956.signatures.applicant?.isSigned || false,
        agent: form956.signatures.agent?.isSigned || false
      }
    });

  } catch (error) {
    console.error('❌ Error in sign route:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get all Form 956s for agent
// @route   GET /api/form956/agent/my-forms
// @access  Private (Agent)
router.get('/agent/my-forms', authorize('agent', 'admin'), async (req, res) => {
  try {
    const agent = await Agent.findOne({ userId: req.user._id });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    const forms = await Form956.find({
      agentId: agent._id,
      tenantId: req.tenantId
    })
    .populate('studentId', 'personalInfo')
    .populate('applicationId', 'applicationRef status')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: forms.length,
      forms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get Form 956 by application ID
// @route   GET /api/form956/application/:applicationId
// @access  Private
router.get('/application/:applicationId', async (req, res) => {
  try {
    const form956 = await Form956.findOne({
      applicationId: req.params.applicationId,
      tenantId: req.tenantId
    })
    .populate('studentId', 'personalInfo')
    .populate('agentId', 'personalInfo marnNumber');

    if (!form956) {
      return res.status(404).json({
        success: false,
        message: 'No Form 956 found for this application'
      });
    }

    res.json({
      success: true,
      form956
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

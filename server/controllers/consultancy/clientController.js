// const Client = require('../../models/Client.model');
// const Case = require('../../models/Case.model');
// const Application = require('../../models/Application.model');

// class ClientController {
//   // ================= CREATE NEW CLIENT =================
//   async createClient(req, res) {
//     try {
//       const {
//         personalDetails,
//         occupationDetails,
//         englishProficiency,
//         visaPreferences,
//         consultancyId
//       } = req.body;

//       const newClient = new Client({
//         tenantId: req.user.tenantId,
//         consultancyId: consultancyId || req.user.consultancyId,
//         agentId: req.user.agentId,
//         personalDetails,
//         occupationDetails,
//         englishProficiency,
//         visaPreferences,
//         status: 'Lead',
//         createdBy: req.user._id
//       });

//       await newClient.save();

//       // Auto-create case
//       const newCase = new Case({
//         tenantId: req.user.tenantId,
//         consultancyId: consultancyId || req.user.consultancyId,
//         clientId: newClient._id,
//         agentId: req.user.agentId,
//         caseTitle: `${personalDetails.firstName} ${personalDetails.lastName} - Visa Application`,
//         description: `Case for visa subclass ${visaPreferences.primaryVisa || 'TBD'}`,
//         stage: 'Initial Consultation',
//         status: 'Not Started',
//         createdBy: req.user.agentId
//       });

//       await newCase.save();

//       res.status(201).json({
//         success: true,
//         message: 'Client created successfully',
//         client: newClient,
//         case: newCase
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error creating client',
//         error: error.message
//       });
//     }
//   }

//   // ================= GET ALL CLIENTS =================
//   async getAllClients(req, res) {
//     try {
//       const {
//         status,
//         visaType,
//         sortBy = 'createdAt',
//         order = -1,
//         page = 1,
//         limit = 20
//       } = req.query;

//       const filters = {
//         tenantId: req.user.tenantId,
//         consultancyId: req.user.consultancyId,
//         isActive: true
//       };

//       if (status) filters.status = status;
//       if (visaType) filters['visaPreferences.primaryVisa'] = visaType;

//       const skip = (page - 1) * limit;

//       const clients = await Client.find(filters)
//         .sort({ [sortBy]: order })
//         .skip(skip)
//         .limit(Number(limit))
//         .select(
//           'personalDetails occupationDetails status visaPreferences createdAt'
//         );

//       const total = await Client.countDocuments(filters);

//       res.json({
//         success: true,
//         clients,
//         pagination: {
//           total,
//           pages: Math.ceil(total / limit),
//           currentPage: Number(page)
//         }
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error fetching clients',
//         error: error.message
//       });
//     }
//   }

//   // ================= GET CLIENT DETAIL =================
//   async getClientDetail(req, res) {
//     try {
//       const { clientId } = req.params;

//       const client = await Client.findById(clientId)
//         .populate('applications', 'applicationRef visaSubclass status')
//         .populate('cases', 'caseNumber stage status')
//         .populate('documents', 'fileName category status');

//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       res.json({ success: true, client });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error fetching client',
//         error: error.message
//       });
//     }
//   }

//   // ================= UPDATE CLIENT =================
//   async updateClient(req, res) {
//     try {
//       const { clientId } = req.params;

//       const client = await Client.findByIdAndUpdate(
//         clientId,
//         {
//           ...req.body,
//           lastModifiedBy: req.user._id,
//           updatedAt: new Date()
//         },
//         { new: true }
//       );

//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Client updated successfully',
//         client
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error updating client',
//         error: error.message
//       });
//     }
//   }

//   // ================= UPDATE CLIENT STATUS =================
//   async updateClientStatus(req, res) {
//     try {
//       const { clientId } = req.params;
//       const { status, notes } = req.body;

//       const client = await Client.findById(clientId);
//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       client.statusHistory.push({
//         status,
//         changedDate: new Date(),
//         changedBy: req.user._id,
//         notes
//       });

//       client.status = status;
//       client.lastModifiedBy = req.user._id;

//       await client.save();

//       res.json({
//         success: true,
//         message: `Client status updated to ${status}`,
//         client
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error updating status',
//         error: error.message
//       });
//     }
//   }

//   // ================= SOFT DELETE CLIENT =================
//   async deleteClient(req, res) {
//     try {
//       const { clientId } = req.params;

//       const client = await Client.findByIdAndUpdate(
//         clientId,
//         { isActive: false, updatedAt: new Date() },
//         { new: true }
//       );

//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Client deleted successfully',
//         client
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error deleting client',
//         error: error.message
//       });
//     }
//   }

//   // ================= CALCULATE VISA POINTS =================
//   async calculateVisaPoints(req, res) {
//     try {
//       const { clientId } = req.params;
//       const {
//         age,
//         englishLanguage,
//         qualifications,
//         workExperience,
//         other
//       } = req.body;

//       const client = await Client.findById(clientId);
//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       const total =
//         age + englishLanguage + qualifications + workExperience + other;

//       client.pointsBreakdown = {
//         age,
//         englishLanguage,
//         qualifications,
//         workExperience,
//         otherFactors: other,
//         total
//       };

//       await client.save();

//       res.json({
//         success: true,
//         message: 'Visa points calculated',
//         pointsBreakdown: client.pointsBreakdown,
//         eligible189: total >= 65
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error calculating points',
//         error: error.message
//       });
//     }
//   }

//   // ================= ADD COMMUNICATION =================
//   async addCommunication(req, res) {
//     try {
//       const { clientId } = req.params;
//       const {
//         communicationType,
//         subject,
//         notes,
//         nextFollowUpDate
//       } = req.body;

//       const client = await Client.findById(clientId);
//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       client.communicationHistory.push({
//         date: new Date(),
//         communicationType,
//         subject,
//         notes,
//         communicatedBy: req.user._id
//       });

//       if (nextFollowUpDate) {
//         client.nextScheduledFollowUp = nextFollowUpDate;
//       }

//       client.lastInteractionDate = new Date();

//       await client.save();

//       res.json({
//         success: true,
//         message: 'Communication logged',
//         client
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error logging communication',
//         error: error.message
//       });
//     }
//   }

//   // ================= CLIENT DASHBOARD SUMMARY =================
//   async getClientSummary(req, res) {
//     try {
//       const { clientId } = req.params;

//       const client = await Client.findById(clientId);
//       if (!client) {
//         return res.status(404).json({
//           success: false,
//           message: 'Client not found'
//         });
//       }

//       const applications = await Application.find({ clientId })
//         .select('applicationRef visaSubclass status createdAt');

//       const cases = await Case.find({ clientId })
//         .select('caseNumber stage status progressPercentage');

//       const summary = {
//         client: {
//           name: `${client.personalDetails.firstName} ${client.personalDetails.lastName}`,
//           email: client.personalDetails.email,
//           status: client.status,
//           visaPreference: client.visaPreferences.primaryVisa
//         },
//         points: client.pointsBreakdown?.total || 0,
//         applicationsCount: applications.length,
//         casesCount: cases.length,
//         applications,
//         cases,
//         lastInteraction: client.lastInteractionDate,
//         nextFollowUp: client.nextScheduledFollowUp
//       };

//       res.json({ success: true, summary });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: 'Error fetching summary',
//         error: error.message
//       });
//     }
//   }
// }

// module.exports = new ClientController();



const Client = require('../../models/Client.model');
const Case = require('../../models/Case.model');
const Application = require('../../models/Application.model');

class ClientController {
  // ================= CREATE NEW CLIENT =================
  createClient = async (req, res) => {
    try {
      const {
        personalDetails,
        occupationDetails,
        englishProficiency,
        visaPreferences,
        consultancyId
      } = req.body;

      const newClient = new Client({
        tenantId: req.user.tenantId,
        consultancyId: consultancyId || req.user.consultancyId,
        agentId: req.user.agentId,
        personalDetails,
        occupationDetails,
        englishProficiency,
        visaPreferences,
        status: 'Lead',
        createdBy: req.user._id
      });

      await newClient.save();

      const newCase = new Case({
        tenantId: req.user.tenantId,
        consultancyId: consultancyId || req.user.consultancyId,
        clientId: newClient._id,
        agentId: req.user.agentId,
        caseTitle: `${personalDetails.firstName} ${personalDetails.lastName} - Visa Application`,
        description: `Case for visa subclass ${visaPreferences.primaryVisa || 'TBD'}`,
        stage: 'Initial Consultation',
        status: 'Not Started',
        createdBy: req.user._id
      });

      await newCase.save();

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        client: newClient,
        case: newCase
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating client', error: error.message });
    }
  };

  // ================= GET ALL CLIENTS =================
  getAllClients = async (req, res) => {
    try {
      const { status, visaType, sortBy = 'createdAt', order = -1, page = 1, limit = 20 } = req.query;
      const filters = {
        tenantId: req.user.tenantId,
        consultancyId: req.user.consultancyId,
        isActive: true
      };

      if (status) filters.status = status;
      if (visaType) filters['visaPreferences.primaryVisa'] = visaType;

      const skip = (page - 1) * limit;
      const clients = await Client.find(filters)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(Number(limit))
        .select('personalDetails occupationDetails status visaPreferences createdAt');

      const total = await Client.countDocuments(filters);

      res.json({
        success: true,
        clients,
        pagination: { total, pages: Math.ceil(total / limit), currentPage: Number(page) }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching clients', error: error.message });
    }
  };

  // ================= GET CLIENT DETAIL =================
  getClientDetail = async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await Client.findById(clientId)
        .populate('applications', 'applicationRef visaSubclass status')
        .populate('cases', 'caseNumber stage status')
        .populate('documents', 'fileName category status');

      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      res.json({ success: true, client });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching client', error: error.message });
    }
  };

  // ================= UPDATE CLIENT =================
  updateClient = async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await Client.findByIdAndUpdate(
        clientId,
        { ...req.body, lastModifiedBy: req.user._id, updatedAt: new Date() },
        { new: true }
      );
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      res.json({ success: true, message: 'Client updated successfully', client });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating client', error: error.message });
    }
  };

  // ================= CALCULATE VISA POINTS =================
  calculateVisaPoints = async (req, res) => {
    try {
      const { clientId } = req.params;
      const { age, englishLanguage, qualifications, workExperience, other } = req.body;
      const client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

      const total = age + englishLanguage + qualifications + workExperience + other;
      client.pointsBreakdown = { age, englishLanguage, qualifications, workExperience, otherFactors: other, total };
      await client.save();

      res.json({ success: true, message: 'Visa points calculated', pointsBreakdown: client.pointsBreakdown, eligible189: total >= 65 });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error calculating points', error: error.message });
    }
  };

  // ================= SOFT DELETE CLIENT =================
  deleteClient = async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await Client.findByIdAndUpdate(clientId, { isActive: false, updatedAt: new Date() }, { new: true });
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      res.json({ success: true, message: 'Client deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting client', error: error.message });
    }
  };
}

// Exporting an instance of the class
module.exports = new ClientController();
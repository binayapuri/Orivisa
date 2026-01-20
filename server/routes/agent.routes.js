// File: server/routes/agent.routes.js

const express = require('express');
const router = express.Router();
const {
  getAgentProfile,
  updateAgentProfile,
  verifyMARN,
  getLeads,
  acceptLead,
  rejectLead,
  getClients,
  getClientDetails,
  getApplications,
  createApplication,
  updateApplication,
  getCommissions,
  getAnalytics,
  updateSubscription
} = require('../controllers/agent.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const tenantIsolation = require('../middleware/tenantIsolation.middleware');

router.use(protect);
router.use(authorize('agent'));
router.use(tenantIsolation);

router.route('/profile')
  .get(getAgentProfile)
  .put(updateAgentProfile);

router.post('/verify-marn', verifyMARN);

router.route('/leads')
  .get(getLeads);
router.post('/leads/:id/accept', acceptLead);
router.post('/leads/:id/reject', rejectLead);

router.route('/clients')
  .get(getClients);
router.get('/clients/:id', getClientDetails);

router.route('/applications')
  .get(getApplications)
  .post(createApplication);

router.put('/applications/:id', updateApplication);

router.get('/commissions', getCommissions);
router.get('/analytics', getAnalytics);
router.put('/subscription', updateSubscription);

module.exports = router;

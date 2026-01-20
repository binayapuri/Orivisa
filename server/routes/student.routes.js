// File: server/routes/student.routes.js

const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  checkEligibility,
  searchColleges,
  searchAgents,
  assignAgent,
  getMyApplications,
  getRewards,
  withdrawCashback
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const tenantIsolation = require('../middleware/tenantIsolation.middleware');

// Apply middleware to all routes
router.use(protect);
router.use(authorize('student'));
router.use(tenantIsolation);

router.route('/profile')
  .get(getStudentProfile)
  .put(updateStudentProfile);

router.post('/eligibility/check', checkEligibility);
router.get('/colleges/search', searchColleges);
router.get('/agents/search', searchAgents);
router.post('/agents/assign', assignAgent);
router.get('/applications', getMyApplications);
router.get('/rewards', getRewards);
router.post('/rewards/withdraw', withdrawCashback);

module.exports = router;

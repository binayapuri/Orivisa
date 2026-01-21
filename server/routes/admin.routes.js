const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../../server/controllers/adminController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Only Admins can see the dashboard stats
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
const Application = require('../models/Application.model');
const Client = require('../models/Client.model');

exports.getAdminStats = async (req, res) => {
  try {
    // 1. Get counts
    const totalApplications = await Application.countDocuments({ tenantId: req.user.tenantId });
    const totalClients = await Client.countDocuments({ tenantId: req.user.tenantId });

    // 2. Visa Type Breakdown
    const visa189Count = await Application.countDocuments({ visaSubclass: '189' });
    const visa190Count = await Application.countDocuments({ visaSubclass: '190' });
    const visa491Count = await Application.countDocuments({ visaSubclass: '491' });

    // 3. Mock trend data (Replace with real aggregation later)
    const applicationTrend = [30, 40, 35, 50, 49, 60, 70];

    res.json({
      success: true,
      stats: {
        totalApplications,
        totalClients,
        successRate: 94,
        revenue: 450000,
        visa189Count,
        visa190Count,
        visa491Count,
        applicationTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
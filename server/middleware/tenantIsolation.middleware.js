// File: server/middleware/tenantIsolation.middleware.js

/**
 * Multi-Tenant Data Isolation
 * Ensures users can only access data within their tenant boundary
 */

const User = require('../models/User.model');

const tenantIsolation = async (req, res, next) => {
  try {
    // Attach tenant context to request
    if (req.user && req.user.tenantId) {
      req.tenantId = req.user.tenantId;
      
      // Add tenant filter to all mongoose queries automatically
      const originalFind = require('mongoose').Model.find;
      const originalFindOne = require('mongoose').Model.findOne;
      
      // Override find methods to always include tenantId
      require('mongoose').Model.find = function(conditions, ...args) {
        conditions = conditions || {};
        if (this.schema.path('tenantId')) {
          conditions.tenantId = req.tenantId;
        }
        return originalFind.call(this, conditions, ...args);
      };
      
      require('mongoose').Model.findOne = function(conditions, ...args) {
        conditions = conditions || {};
        if (this.schema.path('tenantId')) {
          conditions.tenantId = req.tenantId;
        }
        return originalFindOne.call(this, conditions, ...args);
      };
    }
    
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Tenant isolation error' });
  }
};

module.exports = tenantIsolation;

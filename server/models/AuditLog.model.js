// File: server/models/AuditLog.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditLogSchema = new Schema(
  {
    // 🔑 IDENTIFICATION
    auditId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },

    // 🏢 TENANT
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },

    // 👤 ACTOR
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userEmail: String,
    userName: String,

    // 🎯 ACTION
    action: {
      type: String,
      enum: [
        'create', 'read', 'update', 'delete',
        'login', 'logout', 'permission_change',
        'file_upload', 'file_download', 'export',
        'status_change', 'archive', 'restore'
      ],
      required: true,
      index: true
    },

    // 📎 RESOURCE
    resourceType: {
      type: String,
      enum: [
        'application', 'client', 'case', 'document',
        'user', 'tenant', 'message', 'transaction', 'template'
      ],
      required: true,
      index: true
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },
    resourceName: String,

    // 📝 CHANGES
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    changeSummary: String,

    // 📍 IP & LOCATION
    ipAddress: String,
    userAgent: String,
    location: String,

    // ✅ STATUS
    status: {
      type: String,
      enum: ['success', 'failure', 'partial'],
      default: 'success'
    },
    errorMessage: String,

    // 📅 TIMESTAMP
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false,
    collection: 'audit_logs'
  }
);

// 🔍 INDEXES
auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, userId: 1, action: 1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

// File: server/models/Notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    // 🔑 IDENTIFICATION
    notificationId: {
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

    // 👤 RECIPIENT
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // 📝 NOTIFICATION DETAILS
    type: {
      type: String,
      enum: [
        'application_update',
        'document_uploaded',
        'task_assigned',
        'deadline_reminder',
        'message_received',
        'status_changed',
        'system_alert',
        'other'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 500
    },

    // 📎 CONTEXT
    relatedEntity: {
      type: String, // 'application', 'client', 'case', etc
      sparse: true
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      sparse: true,
      index: true
    },

    // 📞 CHANNELS
    channels: [{
      type: String,
      enum: ['in_app', 'email', 'sms', 'push']
    }],

    // ✅ STATUS
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
      index: true
    },
    readAt: Date,

    // 🔔 PRIORITY
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },

    // 📅 TIMESTAMPS
    createdAt: { type: Date, default: Date.now, index: true },
    expiresAt: Date
  },
  {
    timestamps: false,
    collection: 'notifications'
  }
);

// 🔍 INDEXES
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);

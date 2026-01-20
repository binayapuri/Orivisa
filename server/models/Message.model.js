// File: server/models/Message.model.js

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Original content (before filtering)
  originalContent: {
    type: String,
    required: true,
    select: false // Hidden by default
  },
  
  // Filtered content (displayed to users)
  displayContent: {
    type: String,
    required: true
  },
  
  // Contact Info Detection
  containsContactInfo: {
    type: Boolean,
    default: false
  },
  
  detectedPatterns: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'url', 'social_media']
    },
    value: String,
    redacted: Boolean
  }],
  
  // Compliance Flags
  complianceFlags: {
    isReviewed: { type: Boolean, default: false },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    action: {
      type: String,
      enum: ['approved', 'redacted', 'blocked', 'warning_issued']
    }
  },
  
  // Message Metadata
  messageType: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  
  attachments: [{
    fileName: String,
    fileSize: Number,
    mimeType: String,
    s3Key: String,
    uploadedAt: Date
  }],
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: Date,
  
  isDeleted: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, recipientId: 1 });
MessageSchema.index({ containsContactInfo: 1, 'complianceFlags.isReviewed': 1 });

module.exports = mongoose.model('Message', MessageSchema);

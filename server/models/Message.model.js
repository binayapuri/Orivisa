// // File: server/models/Message.model.js

// const mongoose = require('mongoose');

// const MessageSchema = new mongoose.Schema({
//   tenantId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     index: true
//   },
  
//   conversationId: {
//     type: String,
//     required: true,
//     index: true
//   },
  
//   senderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
//   recipientId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
  
//   // Original content (before filtering)
//   originalContent: {
//     type: String,
//     required: true,
//     select: false // Hidden by default
//   },
  
//   // Filtered content (displayed to users)
//   displayContent: {
//     type: String,
//     required: true
//   },
  
//   // Contact Info Detection
//   containsContactInfo: {
//     type: Boolean,
//     default: false
//   },
  
//   detectedPatterns: [{
//     type: {
//       type: String,
//       enum: ['email', 'phone', 'whatsapp', 'url', 'social_media']
//     },
//     value: String,
//     redacted: Boolean
//   }],
  
//   // Compliance Flags
//   complianceFlags: {
//     isReviewed: { type: Boolean, default: false },
//     reviewedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     reviewedAt: Date,
//     action: {
//       type: String,
//       enum: ['approved', 'redacted', 'blocked', 'warning_issued']
//     }
//   },
  
//   // Message Metadata
//   messageType: {
//     type: String,
//     enum: ['text', 'file', 'system'],
//     default: 'text'
//   },
  
//   attachments: [{
//     fileName: String,
//     fileSize: Number,
//     mimeType: String,
//     s3Key: String,
//     uploadedAt: Date
//   }],
  
//   isRead: {
//     type: Boolean,
//     default: false
//   },
  
//   readAt: Date,
  
//   isDeleted: {
//     type: Boolean,
//     default: false
//   }
  
// }, {
//   timestamps: true
// });

// // Indexes
// MessageSchema.index({ conversationId: 1, createdAt: -1 });
// MessageSchema.index({ senderId: 1, recipientId: 1 });
// MessageSchema.index({ containsContactInfo: 1, 'complianceFlags.isReviewed': 1 });

// module.exports = mongoose.model('Message', MessageSchema);

// File: server/models/Message.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    // 🔑 IDENTIFICATION
    messageId: {
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

    // 👥 PARTICIPANTS
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipientIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],

    // 📎 CONTEXT
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      sparse: true
    },
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      sparse: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      sparse: true
    },

    // 📝 MESSAGE CONTENT
    subject: String,
    content: {
      type: String,
      required: true,
      maxlength: 10000
    },
    messageType: {
      type: String,
      enum: ['email', 'internal_note', 'sms', 'whatsapp', 'call_log'],
      default: 'internal_note'
    },

    // 📎 ATTACHMENTS
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String
    }],

    // ✅ READ STATUS
    readBy: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: Date
    }],
    isRead: { type: Boolean, default: false },

    // 💬 REPLIES
    replies: [{
      type: Schema.Types.ObjectId,
      ref: 'Message'
    }],
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      sparse: true
    },

    // 🏷️ PRIORITY
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },

    // 🗑️ SOFT DELETE
    isDeleted: { type: Boolean, default: false, index: true },

    // 📅 TIMESTAMPS
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'messages'
  }
);

// 🔍 INDEXES
messageSchema.index({ tenantId: 1, senderId: 1, createdAt: -1 });
messageSchema.index({ recipientIds: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);

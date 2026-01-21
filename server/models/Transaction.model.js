// File: server/models/Transaction.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    // 🔑 IDENTIFICATION
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      // Format: "TXN_" + YYYY + XXXXXX
    },

    // 🏢 TENANT
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },

    // 📎 RELATIONSHIPS
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },

    // 💰 TRANSACTION DETAILS
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'AUD',
      enum: ['AUD', 'USD', 'GBP', 'INR', 'CNY']
    },
    description: String,
    type: {
      type: String,
      enum: ['payment', 'refund', 'deposit', 'invoice', 'credit'],
      required: true,
      index: true
    },

    // 💳 PAYMENT METHOD
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'credit_card', 'debit_card', 'paypal', 'check', 'cash']
    },
    paymentDetails: {
      referenceNumber: String,
      bankName: String,
      accountNumber: String,
      checkNumber: String
    },

    // ✅ STATUS
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    statusReason: String,

    // 📅 DATES
    transactionDate: { type: Date, default: Date.now },
    processedDate: Date,
    dueDate: Date,

    // 📝 INVOICE & RECEIPT
    invoiceNumber: String,
    receiptNumber: String,
    invoiceUrl: String,

    // 👤 RECORDED BY
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // 📋 NOTES
    notes: String,

    // 📅 TIMESTAMPS
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'transactions'
  }
);

// 🔍 INDEXES
transactionSchema.index({ tenantId: 1, transactionId: 1 }, { unique: true });
transactionSchema.index({ tenantId: 1, status: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

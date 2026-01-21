// File: server/models/Tenant.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tenantSchema = new Schema(
  {
    // 🔑 PRIMARY IDENTIFIERS
    tenantId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      // Format: "org_" + timestamp + random
      trim: true
    },
    
    // 📋 ORGANIZATION INFO
    organization: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
        index: true
      },
      legalName: {
        type: String,
        trim: true
      },
      abn: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        // Australian Business Number
        validate: {
          validator: function(v) {
            return !v || /^\d{11}$/.test(v);
          },
          message: 'Invalid ABN format'
        }
      },
      mara: {
        type: String,
        sparse: true,
        trim: true
        // Migration Agents Registration Authority number
      },
      registrationDate: {
        type: Date,
        default: Date.now
      }
    },

    // 👤 OWNER/ADMIN
    owner: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      email: String,
      name: String
    },

    // 📍 LOCATION
    location: {
      address: {
        street: String,
        suburb: String,
        state: {
          type: String,
          enum: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT']
        },
        postcode: String,
        country: {
          type: String,
          default: 'Australia'
        }
      },
      timezone: {
        type: String,
        default: 'Australia/Sydney'
      }
    },

    // 💼 SUBSCRIPTION & BILLING
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free'
      },
      status: {
        type: String,
        enum: ['active', 'suspended', 'cancelled'],
        default: 'active'
      },
      startDate: Date,
      renewalDate: Date,
      maxUsers: {
        type: Number,
        default: 5
      },
      maxApplications: {
        type: Number,
        default: 50
      },
      features: {
        aiCompass: { type: Boolean, default: false },
        pointsCalculator: { type: Boolean, default: true },
        documentManagement: { type: Boolean, default: true },
        advancedAnalytics: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false }
      }
    },

    // 🔒 SECURITY & COMPLIANCE
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      ipWhitelist: [String],
      dataEncryption: { type: Boolean, default: true },
      complianceStatus: {
        type: String,
        enum: ['pending', 'compliant', 'non-compliant'],
        default: 'pending'
      }
    },

    // 📊 STATISTICS
    statistics: {
      totalUsers: { type: Number, default: 1 },
      totalApplications: { type: Number, default: 0 },
      totalDocuments: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      lastActivityDate: Date
    },

    // 🎨 BRANDING
    branding: {
      logo: String, // URL to logo
      primaryColor: {
        type: String,
        default: '#38bdf8' // Teal
      },
      accentColor: {
        type: String,
        default: '#0f172a' // Dark slate
      },
      customDomain: {
        type: String,
        sparse: true,
        unique: true
      }
    },

    // 📞 CONTACT
    contact: {
      phone: String,
      supportEmail: String,
      website: String,
      socialMedia: {
        linkedin: String,
        twitter: String,
        facebook: String
      }
    },

    // ⚙️ STATUS
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'suspended'],
      default: 'active',
      index: true
    },

    // 🗑️ SOFT DELETE
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    // 📅 TIMESTAMPS
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'tenants'
  }
);

// 🔍 INDEXES FOR PERFORMANCE
tenantSchema.index({ tenantId: 1, isDeleted: 1 });
tenantSchema.index({ 'organization.abn': 1 });
tenantSchema.index({ status: 1, isDeleted: 1 });
tenantSchema.index({ createdAt: -1 });

// 🎯 VIRTUAL FOR DOCUMENT COUNT
tenantSchema.virtual('activeDocuments').get(function() {
  return this.statistics.totalDocuments;
});

module.exports = mongoose.model('Tenant', tenantSchema);

const mongoose = require("mongoose");

const employeePermissionsSchema = new mongoose.Schema(
  {
    // User references
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    // Job Posts
    canViewJobPosts: {
      type: Boolean,
      default: false,
    },
    canCreateJobPosts: {
      type: Boolean,
      default: false,
    },

    // Candidates
    canViewCandidates: {
      type: Boolean,
      default: false,
    },
    canViewInterviewResults: {
      type: Boolean,
      default: false,
    },
    canContactCandidates: {
      type: Boolean,
      default: false,
    },

    // Matching
    canAccessMatching: {
      type: Boolean,
      default: false,
    },

    // HR Agents
    canUseHRAgents: {
      type: Boolean,
      default: false,
    },

    // Team Management
    canManageTeam: {
      type: Boolean,
      default: false,
    },
    canInviteMembers: {
      type: Boolean,
      default: false,
    },
    canAssignRoles: {
      type: Boolean,
      default: false,
    },
    canRemoveEmployee: {
      type: Boolean,
      default: false,
    },
    canUpdateEmployeeDepartment: {
      type: Boolean,
      default: false,
    },

    // Campaigns
    canViewCampaigns: {
      type: Boolean,
      default: false,
    },
    canCreateCampaign: {
      type: Boolean,
      default: false,
    },
    canEditCampaign: {
      type: Boolean,
      default: false,
    },
    canDeleteCampaign: {
      type: Boolean,
      default: false,
    },
    canPublishCampaign: {
      type: Boolean,
      default: false,
    },
    canViewCampaignAnalytics: {
      type: Boolean,
      default: false,
    },

    // Departments
    canViewDepartments: {
      type: Boolean,
      default: false,
    },
    canCreateDepartment: {
      type: Boolean,
      default: false,
    },
    canEditDepartment: {
      type: Boolean,
      default: false,
    },
    canDeleteDepartment: {
      type: Boolean,
      default: false,
    },

    // Settings
    canViewCompanyProfile: {
      type: Boolean,
      default: false,
    },
    canEditCompanyProfile: {
      type: Boolean,
      default: false,
    },
    canManageSettings: {
      type: Boolean,
      default: false,
    },
    canManageBilling: {
      type: Boolean,
      default: false,
    },
    canManageIntegrations: {
      type: Boolean,
      default: false,
    },

    // Admin tracking
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create index for userId and profileId for faster queries
employeePermissionsSchema.index({ userId: 1 });
employeePermissionsSchema.index({ profileId: 1 });
employeePermissionsSchema.index({ userId: 1, profileId: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
employeePermissionsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("EmployeePermissions", employeePermissionsSchema);

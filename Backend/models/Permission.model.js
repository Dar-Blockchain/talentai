const mongoose = require("mongoose");

/**
 * Permission Schema
 * Stores company permissions separately from Profile
 * Linked to both User and Profile for flexibility
 */
const permissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    // Job Post Permissions
    canCreateJobPosts: { type: Boolean, default: true },
    
    // Candidate Permissions
    canViewCandidateProfiles: { type: Boolean, default: true },
    canContactCandidates: { type: Boolean, default: true },

    // HR Agent Permissions
    canUseHRAgents: { type: Boolean, default: true },

   
    // Team Permissions
    canManageTeam: { type: Boolean, default: true },
    canInviteMembers: { type: Boolean, default: true },
    canAssignRoles: { type: Boolean, default: true },

    // Metadata
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Ensure one permission document per user/profile
permissionSchema.index({ userId: 1, profileId: 1 }, { unique: true });

module.exports = mongoose.model("Permission", permissionSchema);

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
    canCreateJobPosts: { type: Boolean, default: false },
    
    // Candidate Permissions
    canUnlockCandidates: { type: Boolean, default: false },
    canViewCandidateProfiles: { type: Boolean, default: false },
    canContactCandidates: { type: Boolean, default: false },

    

    // Matching Permissions
    canAccessMatching: { type: Boolean, default: false },

    // HR Agent Permissions
    canUseHRAgents: { type: Boolean, default: false },

   
    // Team Permissions
    canManageTeam: { type: Boolean, default: false },
    canInviteMembers: { type: Boolean, default: false },
    canAssignRoles: { type: Boolean, default: false },

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

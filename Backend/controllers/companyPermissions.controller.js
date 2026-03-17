/**
 * Company Permissions Controller
 * Handles company permissions management operations (Admin only)
 *
 * Uses the new PermissionModel with 8 granular permissions:
 * - canCreateJobPosts
 * - canUnlockCandidates
 * - canViewCandidateProfiles
 * - canContactCandidates
 * - canUseHRAgents
 * - canManageTeam
 * - canInviteMembers
 * - canAssignRoles
 */

const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const Permission = require("../models/Permission.model");

/**
 * Get company permissions
 * GET /admin/companies/:companyId/permissions
 */
module.exports.getCompanyPermissions = async (req, res) => {
  try {
    const { companyId } = req.params;

    console.log(
      "📥 [Permissions] Fetching permissions for company:",
      companyId,
    );

    // Find the user and populate their profile
    const user = await User.findById(companyId).populate("profile");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Company user not found",
      });
    }

    // Verify this is a company user
    if (user.role !== "Company") {
      return res.status(400).json({
        success: false,
        message: "User is not a company",
      });
    }

    if (!user.profile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Find or create permissions document
    let permission = await Permission.findOne({
      userId: user._id,
      profileId: user.profile._id,
    });

    // If no permissions exist, return defaults
    if (!permission) {
      console.log(
        "⚠️ [Permissions] No permission document found, returning defaults",
      );
      return res.status(200).json({
        success: true,
        permissions: {
          canCreateJobPosts: true,
          canUnlockCandidates: true,
          canViewCandidateProfiles: true,
          canContactCandidates: true,
          canUseHRAgents: true,
          canManageTeam: true,
          canInviteMembers: true,
          canAssignRoles: true,
        },
      });
    }

    console.log("✅ [Permissions] Found permission document:", permission._id);

    // Return the 8 permissions from PermissionModel
    const permissions = {
      canCreateJobPosts: permission.canCreateJobPosts,
      canUnlockCandidates: permission.canUnlockCandidates,
      canViewCandidateProfiles: permission.canViewCandidateProfiles,
      canContactCandidates: permission.canContactCandidates,
      canUseHRAgents: permission.canUseHRAgents,
      canManageTeam: permission.canManageTeam,
      canInviteMembers: permission.canInviteMembers,
      canAssignRoles: permission.canAssignRoles,
    };

    res.status(200).json({
      success: true,
      permissions: permissions,
    });
  } catch (error) {
    console.error("❌ [Permissions] Error fetching permissions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company permissions: " + error.message,
    });
  }
};

/**
 * Update company permissions
 * POST /admin/companies/:companyId/permissions
 * Body: { permissions: { canCreateJobPosts: boolean, ... } }
 */
module.exports.updateCompanyPermissions = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { permissions } = req.body;

    console.log(
      "📥 [Permissions] Updating permissions for company:",
      companyId,
    );
    console.log("📥 [Permissions] Received data:", permissions);

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid permissions data",
      });
    }

    // Validate all required permission fields
    const requiredFields = [
      "canCreateJobPosts",
      "canUnlockCandidates",
      "canViewCandidateProfiles",
      "canContactCandidates",
      "canUseHRAgents",
      "canManageTeam",
      "canInviteMembers",
      "canAssignRoles",
    ];

    for (const field of requiredFields) {
      if (typeof permissions[field] !== "boolean") {
        console.error(`❌ [Permissions] Missing or invalid field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Missing or invalid field: ${field}`,
        });
      }
    }

    // Find the user and populate their profile
    const user = await User.findById(companyId).populate("profile");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Company user not found",
      });
    }

    // Verify this is a company user
    if (user.role !== "Company") {
      return res.status(400).json({
        success: false,
        message: "User is not a company",
      });
    }

    if (!user.profile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Get admin user ID (the one making the request)
    const adminUserId = req.user?._id;

    // Update or create permissions using the exact fields from the request
    const updatedPermission = await Permission.findOneAndUpdate(
      {
        userId: user._id,
        profileId: user.profile._id,
      },
      {
        $set: {
          canCreateJobPosts: permissions.canCreateJobPosts,
          canUnlockCandidates: permissions.canUnlockCandidates,
          canViewCandidateProfiles: permissions.canViewCandidateProfiles,
          canContactCandidates: permissions.canContactCandidates,
          canUseHRAgents: permissions.canUseHRAgents,
          canManageTeam: permissions.canManageTeam,
          canInviteMembers: permissions.canInviteMembers,
          canAssignRoles: permissions.canAssignRoles,
          lastModifiedBy: adminUserId,
        },
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true,
      },
    );

    console.log(
      "✅ [Permissions] Permission saved successfully:",
      updatedPermission._id,
    );

    // Return the updated permissions
    const resultPermissions = {
      canCreateJobPosts: updatedPermission.canCreateJobPosts,
      canUnlockCandidates: updatedPermission.canUnlockCandidates,
      canViewCandidateProfiles: updatedPermission.canViewCandidateProfiles,
      canContactCandidates: updatedPermission.canContactCandidates,
      canUseHRAgents: updatedPermission.canUseHRAgents,
      canManageTeam: updatedPermission.canManageTeam,
      canInviteMembers: updatedPermission.canInviteMembers,
      canAssignRoles: updatedPermission.canAssignRoles,
    };

    res.status(200).json({
      success: true,
      message: "Company permissions updated successfully",
      permissions: resultPermissions,
    });
  } catch (error) {
    console.error("❌ [Permissions] Error updating permissions:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company permissions: " + error.message,
    });
  }
};

/**
 * Get current user's own permissions
 * GET /permissions/me
 */
module.exports.getMyPermissions = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log(
      "📥 [Permissions] Fetching permissions for current user:",
      userId,
    );

    // Find the user and populate their profile
    const user = await User.findById(userId).populate("profile");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify this is a company user
    if (user.role !== "Company") {
      return res.status(400).json({
        success: false,
        message: "User is not a company",
      });
    }

    if (!user.profile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Find permissions document
    let permission = await Permission.findOne({
      userId: user._id,
      profileId: user.profile._id,
    });

    // If no permissions exist, return defaults
    if (!permission) {
      console.log(
        "⚠️ [Permissions] No permission document found, returning defaults",
      );
      return res.status(200).json({
        success: true,
        permissions: {
          canCreateJobPosts: true,
          canUnlockCandidates: true,
          canViewCandidateProfiles: true,
          canContactCandidates: true,
          canUseHRAgents: true,
          canManageTeam: true,
          canInviteMembers: true,
          canAssignRoles: true,
        },
      });
    }

    console.log("✅ [Permissions] Found permission document:", permission._id);

    // Return the 8 permissions from PermissionModel
    const permissions = {
      canCreateJobPosts: permission.canCreateJobPosts,
      canUnlockCandidates: permission.canUnlockCandidates,
      canViewCandidateProfiles: permission.canViewCandidateProfiles,
      canContactCandidates: permission.canContactCandidates,
      canUseHRAgents: permission.canUseHRAgents,
      canManageTeam: permission.canManageTeam,
      canInviteMembers: permission.canInviteMembers,
      canAssignRoles: permission.canAssignRoles,
    };

    res.status(200).json({
      success: true,
      permissions: permissions,
    });
  } catch (error) {
    console.error("❌ [Permissions] Error fetching own permissions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching permissions: " + error.message,
    });
  }
};

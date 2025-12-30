/**
 * Company Permissions Controller
 * Handles company permissions management operations (Admin only)
 *
 * Frontend uses 9 simplified permissions:
 * - canManageJobPosts (maps to: canCreateJobPosts, canEditJobPosts, canDeleteJobPosts, canViewJobPosts)
 * - canUnlockCandidates (maps to: canUnlockCandidates)
 * - canAccessCandidates (maps to: canViewCandidateProfiles, canExportCandidateData)
 * - canUseMatching (maps to: canAccessMatching, canViewMatchScores, canFilterCandidates)
 * - canUseHRAgents (maps to: canUseHRAgents, canConfigureAgents, canViewAgentInsights)
 * - canManageRecruitment (maps to: canRequestAssessments, canViewAssessmentResults, canViewDetailedScores)
 * - canManageTokens (maps to: canViewBilling, canManageSubscription, canViewInvoices)
 * - canViewAnalytics (maps to: canViewAnalytics, canExportReports, canViewMetrics)
 * - canCommunicate (maps to: canContactCandidates)
 */

const User = require("../models/UserModel");
const Profile = require("../models/ProfileModel");
const Permission = require("../models/PermissionModel");

/**
 * Get company permissions
 * GET /admin/companies/:companyId/permissions
 */
module.exports.getCompanyPermissions = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Find the user and populate their profile
    const user = await User.findById(companyId).populate('profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Company user not found"
      });
    }

    // Verify this is a company user
    if (user.role !== 'Company') {
      return res.status(400).json({
        success: false,
        message: "User is not a company"
      });
    }

    if (!user.profile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      });
    }

    // Find or create permissions document
    let permission = await Permission.findOne({
      userId: user._id,
      profileId: user.profile._id
    });

    // If no permissions exist, create default ones
    if (!permission) {
      permission = await Permission.create({
        userId: user._id,
        profileId: user.profile._id
      });
    }

    // Return simplified permissions directly
    const simplifiedPermissions = {
      canManageJobPosts: permission.canCreateJobPosts,
      canUnlockCandidates: permission.canUnlockCandidates,
      canAccessCandidates: permission.canViewCandidateProfiles,
      canUseMatching: permission.canAccessMatching,
      canUseHRAgents: permission.canUseHRAgents,
      canManageRecruitment: permission.canRequestAssessments,
      canManageTokens: permission.canViewBilling,
      canViewAnalytics: permission.canViewAnalytics,
      canCommunicate: permission.canContactCandidates,
    };

    res.status(200).json({
      success: true,
      permissions: simplifiedPermissions
    });
  } catch (error) {
    console.error("Error fetching company permissions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company permissions: " + error.message
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

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Invalid permissions data"
      });
    }

    // Find the user and populate their profile
    const user = await User.findById(companyId).populate('profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Company user not found"
      });
    }

    // Verify this is a company user
    if (user.role !== 'Company') {
      return res.status(400).json({
        success: false,
        message: "User is not a company"
      });
    }

    if (!user.profile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      });
    }

    // Get admin user ID (the one making the request)
    const adminUserId = req.user?._id;

    // Map simplified permissions to granular permissions
    const canManageJobPosts = permissions.canManageJobPosts ?? true;
    const canUnlockCandidates = permissions.canUnlockCandidates ?? true;
    const canAccessCandidates = permissions.canAccessCandidates ?? true;
    const canUseMatching = permissions.canUseMatching ?? true;
    const canUseHRAgents = permissions.canUseHRAgents ?? true;
    const canManageRecruitment = permissions.canManageRecruitment ?? true;
    const canManageTokens = permissions.canManageTokens ?? true;
    const canViewAnalytics = permissions.canViewAnalytics ?? true;
    const canCommunicate = permissions.canCommunicate ?? true;

    // Update or create permissions
    const updatedPermission = await Permission.findOneAndUpdate(
      {
        userId: user._id,
        profileId: user.profile._id
      },
      {
        $set: {
          // Job Post Permissions (all controlled by canManageJobPosts)
          canCreateJobPosts: canManageJobPosts,
          canEditJobPosts: canManageJobPosts,
          canDeleteJobPosts: canManageJobPosts,
          canViewJobPosts: canManageJobPosts,

          // Unlock Candidate Permission
          canUnlockCandidates: canUnlockCandidates,

          // Candidate Permissions (controlled by canAccessCandidates)
          canViewCandidateProfiles: canAccessCandidates,
          canExportCandidateData: canAccessCandidates,

          // Communication Permission
          canContactCandidates: canCommunicate,

          // Assessment/Recruitment Permissions (controlled by canManageRecruitment)
          canViewAssessmentResults: canManageRecruitment,
          canRequestAssessments: canManageRecruitment,
          canViewDetailedScores: canManageRecruitment,

          // Matching Permissions (all controlled by canUseMatching)
          canAccessMatching: canUseMatching,
          canViewMatchScores: canUseMatching,
          canFilterCandidates: canUseMatching,

          // HR Agent Permissions (all controlled by canUseHRAgents)
          canUseHRAgents: canUseHRAgents,
          canConfigureAgents: canUseHRAgents,
          canViewAgentInsights: canUseHRAgents,

          // Analytics Permissions (all controlled by canViewAnalytics)
          canViewAnalytics: canViewAnalytics,
          canExportReports: canViewAnalytics,
          canViewMetrics: canViewAnalytics,

          // Billing/Token Permissions (controlled by canManageTokens)
          canViewBilling: canManageTokens,
          canManageSubscription: canManageTokens,
          canViewInvoices: canManageTokens,

          // Team Permissions (keep as true by default - not exposed in simplified UI)
          canManageTeam: true,
          canInviteMembers: true,
          canAssignRoles: true,

          // Metadata
          lastModifiedBy: adminUserId,
        }
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true
      }
    );

    // Return simplified permissions directly
    const simplifiedPermissions = {
      canManageJobPosts: updatedPermission.canCreateJobPosts,
      canUnlockCandidates: updatedPermission.canUnlockCandidates,
      canAccessCandidates: updatedPermission.canViewCandidateProfiles,
      canUseMatching: updatedPermission.canAccessMatching,
      canUseHRAgents: updatedPermission.canUseHRAgents,
      canManageRecruitment: updatedPermission.canRequestAssessments,
      canManageTokens: updatedPermission.canViewBilling,
      canViewAnalytics: updatedPermission.canViewAnalytics,
      canCommunicate: updatedPermission.canContactCandidates,
    };

    res.status(200).json({
      success: true,
      message: "Company permissions updated successfully",
      permissions: simplifiedPermissions
    });
  } catch (error) {
    console.error("Error updating company permissions:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company permissions: " + error.message
    });
  }
};

/**
 * Company Permissions Controller
 * Handles company permissions management operations (Admin only)
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

    res.status(200).json({
      success: true,
      data: {
        companyId: user._id,
        companyName: user.profile.companyDetails?.name || user.username,
        permissions: {
          // Job Post Permissions
          canCreateJobPosts: permission.canCreateJobPosts,
          canEditJobPosts: permission.canEditJobPosts,
          canDeleteJobPosts: permission.canDeleteJobPosts,
          canViewJobPosts: permission.canViewJobPosts,

          // Candidate Permissions
          canUnlockCandidates: permission.canUnlockCandidates,
          canViewCandidateProfiles: permission.canViewCandidateProfiles,
          canContactCandidates: permission.canContactCandidates,
          canExportCandidateData: permission.canExportCandidateData,

          // Assessment Permissions
          canViewAssessmentResults: permission.canViewAssessmentResults,
          canRequestAssessments: permission.canRequestAssessments,
          canViewDetailedScores: permission.canViewDetailedScores,

          // Matching Permissions
          canAccessMatching: permission.canAccessMatching,
          canViewMatchScores: permission.canViewMatchScores,
          canFilterCandidates: permission.canFilterCandidates,

          // HR Agent Permissions
          canUseHRAgents: permission.canUseHRAgents,
          canConfigureAgents: permission.canConfigureAgents,
          canViewAgentInsights: permission.canViewAgentInsights,

          // Analytics Permissions
          canViewAnalytics: permission.canViewAnalytics,
          canExportReports: permission.canExportReports,
          canViewMetrics: permission.canViewMetrics,

          // Billing Permissions
          canViewBilling: permission.canViewBilling,
          canManageSubscription: permission.canManageSubscription,
          canViewInvoices: permission.canViewInvoices,

          // Team Permissions
          canManageTeam: permission.canManageTeam,
          canInviteMembers: permission.canInviteMembers,
          canAssignRoles: permission.canAssignRoles,
        }
      }
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

    // Update or create permissions
    const updatedPermission = await Permission.findOneAndUpdate(
      {
        userId: user._id,
        profileId: user.profile._id
      },
      {
        $set: {
          // Job Post Permissions
          canCreateJobPosts: permissions.canCreateJobPosts ?? true,
          canEditJobPosts: permissions.canEditJobPosts ?? true,
          canDeleteJobPosts: permissions.canDeleteJobPosts ?? true,
          canViewJobPosts: permissions.canViewJobPosts ?? true,

          // Candidate Permissions
          canUnlockCandidates: permissions.canUnlockCandidates ?? true,
          canViewCandidateProfiles: permissions.canViewCandidateProfiles ?? true,
          canContactCandidates: permissions.canContactCandidates ?? true,
          canExportCandidateData: permissions.canExportCandidateData ?? true,

          // Assessment Permissions
          canViewAssessmentResults: permissions.canViewAssessmentResults ?? true,
          canRequestAssessments: permissions.canRequestAssessments ?? true,
          canViewDetailedScores: permissions.canViewDetailedScores ?? true,

          // Matching Permissions
          canAccessMatching: permissions.canAccessMatching ?? true,
          canViewMatchScores: permissions.canViewMatchScores ?? true,
          canFilterCandidates: permissions.canFilterCandidates ?? true,

          // HR Agent Permissions
          canUseHRAgents: permissions.canUseHRAgents ?? true,
          canConfigureAgents: permissions.canConfigureAgents ?? true,
          canViewAgentInsights: permissions.canViewAgentInsights ?? true,

          // Analytics Permissions
          canViewAnalytics: permissions.canViewAnalytics ?? true,
          canExportReports: permissions.canExportReports ?? true,
          canViewMetrics: permissions.canViewMetrics ?? true,

          // Billing Permissions
          canViewBilling: permissions.canViewBilling ?? true,
          canManageSubscription: permissions.canManageSubscription ?? true,
          canViewInvoices: permissions.canViewInvoices ?? true,

          // Team Permissions
          canManageTeam: permissions.canManageTeam ?? true,
          canInviteMembers: permissions.canInviteMembers ?? true,
          canAssignRoles: permissions.canAssignRoles ?? true,

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

    res.status(200).json({
      success: true,
      message: "Company permissions updated successfully",
      data: {
        companyId: user._id,
        companyName: user.profile.companyDetails?.name || user.username,
        permissions: {
          // Job Post Permissions
          canCreateJobPosts: updatedPermission.canCreateJobPosts,
          canEditJobPosts: updatedPermission.canEditJobPosts,
          canDeleteJobPosts: updatedPermission.canDeleteJobPosts,
          canViewJobPosts: updatedPermission.canViewJobPosts,

          // Candidate Permissions
          canUnlockCandidates: updatedPermission.canUnlockCandidates,
          canViewCandidateProfiles: updatedPermission.canViewCandidateProfiles,
          canContactCandidates: updatedPermission.canContactCandidates,
          canExportCandidateData: updatedPermission.canExportCandidateData,

          // Assessment Permissions
          canViewAssessmentResults: updatedPermission.canViewAssessmentResults,
          canRequestAssessments: updatedPermission.canRequestAssessments,
          canViewDetailedScores: updatedPermission.canViewDetailedScores,

          // Matching Permissions
          canAccessMatching: updatedPermission.canAccessMatching,
          canViewMatchScores: updatedPermission.canViewMatchScores,
          canFilterCandidates: updatedPermission.canFilterCandidates,

          // HR Agent Permissions
          canUseHRAgents: updatedPermission.canUseHRAgents,
          canConfigureAgents: updatedPermission.canConfigureAgents,
          canViewAgentInsights: updatedPermission.canViewAgentInsights,

          // Analytics Permissions
          canViewAnalytics: updatedPermission.canViewAnalytics,
          canExportReports: updatedPermission.canExportReports,
          canViewMetrics: updatedPermission.canViewMetrics,

          // Billing Permissions
          canViewBilling: updatedPermission.canViewBilling,
          canManageSubscription: updatedPermission.canManageSubscription,
          canViewInvoices: updatedPermission.canViewInvoices,

          // Team Permissions
          canManageTeam: updatedPermission.canManageTeam,
          canInviteMembers: updatedPermission.canInviteMembers,
          canAssignRoles: updatedPermission.canAssignRoles,
        }
      }
    });
  } catch (error) {
    console.error("Error updating company permissions:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company permissions: " + error.message
    });
  }
};

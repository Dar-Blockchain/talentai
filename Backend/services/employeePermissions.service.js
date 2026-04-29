const EmployeePermissions = require("../models/EmployeePermissions.model");

/**
 * Get permissions by userId
 */
exports.getPermissions = async (userId) => {
  try {
    const permissions = await EmployeePermissions.findOne({
      userId,
    })
      .populate("userId", "email firstName lastName")
      .populate("lastModifiedBy", "email firstName lastName");

    if (!permissions) {
      throw new Error("Permissions not found");
    }

    return permissions;
  } catch (error) {
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }
};

/**
 * Update permissions
 */
exports.updatePermissions = async (userId, updatesData, modifiedBy) => {
  try {
    const permissions = await EmployeePermissions.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...updatesData,
          lastModifiedBy: modifiedBy,
        },
      },
      { new: true }
    )
      .populate("userId", "email firstName lastName")
      .populate("lastModifiedBy", "email firstName lastName");

    if (!permissions) {
      throw new Error("Permissions not found");
    }

    return permissions;
  } catch (error) {
    throw new Error(`Failed to update permissions: ${error.message}`);
  }
};

/**
 * Get all available permissions
 */
exports.getAvailablePermissions = async () => {
  try {
    const availablePermissions = {
      jobPosts: {
        canViewJobPosts: "View job posts",
        canCreateJobPosts: "Create job posts",
      },
      candidates: {
        canViewCandidates: "View candidates",
        canCreateContacts: "Create contacts",
        canManageCandidates: "Manage candidates",
      },
      matching: {
        canAccessMatching: "Access matching system",
      },
      hrAgents: {
        canAccessHRAgents: "Access HR agents",
      },
      teamManagement: {
        canViewTeam: "View team",
        canManageTeam: "Manage team",
        canAddTeamMembers: "Add team members",
        canRemoveTeamMembers: "Remove team members",
        canAssignRoles: "Assign roles",
      },
      campaigns: {
        canViewCampaigns: "View campaigns",
        canCreateCampaigns: "Create campaigns",
        canEditCampaigns: "Edit campaigns",
        canDeleteCampaigns: "Delete campaigns",
        canViewCampaignResponses: "View campaign responses",
        canManageCampaignParticipants: "Manage campaign participants",
      },
      departments: {
        canViewDepartments: "View departments",
        canCreateDepartments: "Create departments",
        canEditDepartments: "Edit departments",
        canDeleteDepartments: "Delete departments",
      },
      settings: {
        canViewCompanyProfile: "View company profile",
        canEditCompanyProfile: "Edit company profile",
        canManageCompanySettings: "Manage company settings",
        canViewBilling: "View billing",
        canManageBilling: "Manage billing",
      },
    };

    return availablePermissions;
  } catch (error) {
    throw new Error(
      `Failed to get available permissions: ${error.message}`
    );
  }
};

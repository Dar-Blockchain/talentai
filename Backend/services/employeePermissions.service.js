const EmployeePermissions = require("../models/EmployeePermissions.model");
const User = require("../models/User.model");
const Profile = require("../models/Profile.model");

/**
 * Create new employee permissions
 */
exports.createPermissions = async (userId, profileId, permissionsData) => {
  try {
    // Verify user and profile exist
    const user = await User.findById(userId);
    const profile = await Profile.findById(profileId);

    if (!user || !profile) {
      throw new Error("User or Profile not found");
    }

    // Check if permissions already exist for this user/profile combination
    const existingPermissions = await EmployeePermissions.findOne({
      userId,
      profileId,
    });

    if (existingPermissions) {
      throw new Error(
        "Permissions already exist for this user and profile"
      );
    }

    // Create new permissions
    const permissions = new EmployeePermissions({
      userId,
      profileId,
      ...permissionsData,
    });

    return await permissions.save();
  } catch (error) {
    throw new Error(`Failed to create permissions: ${error.message}`);
  }
};

/**
 * Get permissions by userId and profileId
 */
exports.getPermissions = async (userId, profileId) => {
  try {
    const permissions = await EmployeePermissions.findOne({
      userId,
      profileId,
    })
      .populate("userId", "email firstName lastName")
      .populate("profileId", "name")
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
 * Get all permissions for a profile
 */
exports.getPermissionsByProfile = async (profileId) => {
  try {
    const permissions = await EmployeePermissions.find({ profileId })
      .populate("userId", "email firstName lastName")
      .populate("profileId", "name")
      .populate("lastModifiedBy", "email firstName lastName");

    return permissions;
  } catch (error) {
    throw new Error(`Failed to fetch profile permissions: ${error.message}`);
  }
};

/**
 * Get all permissions for a user
 */
exports.getPermissionsByUser = async (userId) => {
  try {
    const permissions = await EmployeePermissions.find({ userId })
      .populate("userId", "email firstName lastName")
      .populate("profileId", "name")
      .populate("lastModifiedBy", "email firstName lastName");

    return permissions;
  } catch (error) {
    throw new Error(`Failed to fetch user permissions: ${error.message}`);
  }
};

/**
 * Update permissions
 */
exports.updatePermissions = async (userId, profileId, updatesData, modifiedBy) => {
  try {
    const permissions = await EmployeePermissions.findOneAndUpdate(
      { userId, profileId },
      {
        ...updatesData,
        lastModifiedBy: modifiedBy,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    )
      .populate("userId", "email firstName lastName")
      .populate("profileId", "name")
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
 * Delete permissions
 */
exports.deletePermissions = async (userId, profileId) => {
  try {
    const permissions = await EmployeePermissions.findOneAndDelete({
      userId,
      profileId,
    });

    if (!permissions) {
      throw new Error("Permissions not found");
    }

    return { message: "Permissions deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete permissions: ${error.message}`);
  }
};

/**
 * Check if user has a specific permission
 */
exports.hasPermission = async (userId, profileId, permissionKey) => {
  try {
    const permissions = await EmployeePermissions.findOne({
      userId,
      profileId,
    });

    if (!permissions) {
      return false;
    }

    return permissions[permissionKey] === true;
  } catch (error) {
    throw new Error(`Failed to check permission: ${error.message}`);
  }
};

/**
 * Grant multiple permissions to user
 */
exports.grantPermissions = async (userId, profileId, permissionsToGrant, modifiedBy) => {
  try {
    const permissionObject = {};
    permissionsToGrant.forEach((perm) => {
      permissionObject[perm] = true;
    });

    return await exports.updatePermissions(
      userId,
      profileId,
      permissionObject,
      modifiedBy
    );
  } catch (error) {
    throw new Error(`Failed to grant permissions: ${error.message}`);
  }
};

/**
 * Revoke multiple permissions from user
 */
exports.revokePermissions = async (userId, profileId, permissionsToRevoke, modifiedBy) => {
  try {
    const permissionObject = {};
    permissionsToRevoke.forEach((perm) => {
      permissionObject[perm] = false;
    });

    return await exports.updatePermissions(
      userId,
      profileId,
      permissionObject,
      modifiedBy
    );
  } catch (error) {
    throw new Error(`Failed to revoke permissions: ${error.message}`);
  }
};

/**
 * Get permission summary (count of true permissions)
 */
exports.getPermissionSummary = async (userId, profileId) => {
  try {
    const permissions = await EmployeePermissions.findOne({
      userId,
      profileId,
    });

    if (!permissions) {
      throw new Error("Permissions not found");
    }

    const permissionKeys = Object.keys(permissions.toObject())
      .filter((key) => key.startsWith("can"))
      .sort();

    const summary = {
      totalPermissions: permissionKeys.length,
      grantedPermissions: 0,
      permissions: {},
    };

    permissionKeys.forEach((key) => {
      const isGranted = permissions[key] === true;
      summary.permissions[key] = isGranted;
      if (isGranted) {
        summary.grantedPermissions++;
      }
    });

    return summary;
  } catch (error) {
    throw new Error(
      `Failed to get permission summary: ${error.message}`
    );
  }
};

/**
 * Get all available permissions
 */
exports.getAvailablePermissions = async () => {
  try {
    // Create a sample document to extract all permission keys
    const sample = new EmployeePermissions();
    const permissionKeys = Object.keys(sample.toObject())
      .filter((key) => key.startsWith("can"))
      .sort();

    return {
      jobPosts: permissionKeys.filter((p) => p.includes("JobPosts")),
      candidates: permissionKeys.filter((p) => p.includes("Candidates")),
      matching: permissionKeys.filter((p) => p.includes("Matching")),
      hrAgents: permissionKeys.filter((p) => p.includes("HRAgents")),
      team: permissionKeys.filter((p) => p.includes("Team")),
      campaigns: permissionKeys.filter((p) => p.includes("Campaign")),
      departments: permissionKeys.filter((p) => p.includes("Department")),
      settings: permissionKeys.filter((p) => p.includes("Company") || p.includes("Billing") || p.includes("Integrations") || p.includes("Settings")),
    };
  } catch (error) {
    throw new Error(
      `Failed to get available permissions: ${error.message}`
    );
  }
};

/**
 * Clone permissions from one user to another
 */
exports.clonePermissions = async (sourceUserId, sourceProfileId, targetUserId, targetProfileId, modifiedBy) => {
  try {
    const sourcePermissions = await EmployeePermissions.findOne({
      userId: sourceUserId,
      profileId: sourceProfileId,
    });

    if (!sourcePermissions) {
      throw new Error("Source permissions not found");
    }

    // Create a copy of the source permissions (exclude _id and metadata)
    const permissionsCopy = sourcePermissions.toObject();
    delete permissionsCopy._id;
    delete permissionsCopy.createdAt;
    delete permissionsCopy.updatedAt;

    // Check if target already has permissions
    const existingTarget = await EmployeePermissions.findOne({
      userId: targetUserId,
      profileId: targetProfileId,
    });

    if (existingTarget) {
      // Update existing permissions
      return await exports.updatePermissions(
        targetUserId,
        targetProfileId,
        permissionsCopy,
        modifiedBy
      );
    } else {
      // Create new permissions
      return await exports.createPermissions(
        targetUserId,
        targetProfileId,
        { ...permissionsCopy, lastModifiedBy: modifiedBy }
      );
    }
  } catch (error) {
    throw new Error(`Failed to clone permissions: ${error.message}`);
  }
};

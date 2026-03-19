const employeePermissionsService = require("../services/employeePermissions.service");
const CompanyMembershipModel = require("../models/CompanyMembership.model");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("Employee Permissions error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({
    success: false,
    error: error?.message || "Internal server error",
  });
};

/**
 * Check if user is authenticated
 */
const checkAuthentication = (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({
      success: false,
      error: "User not authenticated. Please log in.",
    });
    return false;
  }
  return true;
};

/**
 * Get profileId from user's company membership
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} The profileId
 */
const getProfileIdFromMembership = async (userId) => {
  const membership = await CompanyMembershipModel.findOne({ user: userId });
  if (!membership) {
    throw new Error("User has no company membership");
  }
  return membership.company;
};

/**
 * Create new employee permissions
 * POST /api/employee-permissions
 */
exports.createPermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const { ...permissionsData } = req.body;

    const profileId = await getProfileIdFromMembership(userId);

    const permissions = await employeePermissionsService.createPermissions(
      userId,
      profileId,
      permissionsData
    );

    res.status(201).json({
      success: true,
      message: "Permissions created successfully",
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

/**
 * Get permissions for current user
 * GET /api/employee-permissions
 */
exports.getPermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const profileId = await getProfileIdFromMembership(userId);

    const permissions = await employeePermissionsService.getPermissions(
      userId,
      profileId
    );

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * Get all permissions by profile
 * GET /api/employee-permissions/profile/:profileId
 */
exports.getPermissionsByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: "profileId is required",
      });
    }

    const permissions =
      await employeePermissionsService.getPermissionsByProfile(profileId);

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

/**
 * Get all permissions by user
 * GET /api/employee-permissions/user/:userId
 */
exports.getPermissionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const permissions =
      await employeePermissionsService.getPermissionsByUser(userId);

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

/**
 * Update current user's permissions
 * PUT /api/employee-permissions
 */
exports.updatePermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const { ...permissionsData } = req.body;
    const profileId = await getProfileIdFromMembership(userId);
    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.updatePermissions(
      userId,
      profileId,
      permissionsData,
      modifiedBy
    );

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

/**
 * Delete current user's permissions
 * DELETE /api/employee-permissions
 */
exports.deletePermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const profileId = await getProfileIdFromMembership(userId);

    const result = await employeePermissionsService.deletePermissions(
      userId,
      profileId
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * Check if current user has a specific permission
 * GET /api/employee-permissions/check/:permissionKey
 */
exports.checkPermission = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const { permissionKey } = req.params;
    const profileId = await getProfileIdFromMembership(userId);

    if (!permissionKey) {
      return res.status(400).json({
        success: false,
        error: "permissionKey is required",
      });
    }

    const hasPermission = await employeePermissionsService.hasPermission(
      userId,
      profileId,
      permissionKey
    );

    res.status(200).json({
      success: true,
      permission: permissionKey,
      granted: hasPermission,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

/**
 * Grant permissions to current user
 * POST /api/employee-permissions/grant
 */
exports.grantPermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const { permissionsToGrant } = req.body;
    const profileId = await getProfileIdFromMembership(userId);

    if (!Array.isArray(permissionsToGrant) || permissionsToGrant.length === 0) {
      return res.status(400).json({
        success: false,
        error: "permissionsToGrant must be an array with at least one permission",
      });
    }

    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.grantPermissions(
      userId,
      profileId,
      permissionsToGrant,
      modifiedBy
    );

    res.status(200).json({
      success: true,
      message: `${permissionsToGrant.length} permission(s) granted successfully`,
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

/**
 * Revoke permissions from current user
 * POST /api/employee-permissions/revoke
 */
exports.revokePermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const { permissionsToRevoke } = req.body;
    const profileId = await getProfileIdFromMembership(userId);

    if (!Array.isArray(permissionsToRevoke) || permissionsToRevoke.length === 0) {
      return res.status(400).json({
        success: false,
        error: "permissionsToRevoke must be an array with at least one permission",
      });
    }

    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.revokePermissions(
      userId,
      profileId,
      permissionsToRevoke,
      modifiedBy
    );

    res.status(200).json({
      success: true,
      message: `${permissionsToRevoke.length} permission(s) revoked successfully`,
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

/**
 * Get permission summary for current user
 * GET /api/employee-permissions/summary
 */
exports.getPermissionSummary = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.user._id;
    const profileId = await getProfileIdFromMembership(userId);

    const summary = await employeePermissionsService.getPermissionSummary(
      userId,
      profileId
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    handleError(res, error, 404);
  }
};

/**
 * Get all available permissions
 * GET /api/employee-permissions/available
 */
exports.getAvailablePermissions = async (req, res) => {
  try {
    const availablePermissions =
      await employeePermissionsService.getAvailablePermissions();

    res.status(200).json({
      success: true,
      data: availablePermissions,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

/**
 * Clone permissions from one user to another
 * POST /api/employee-permissions/clone
 */
exports.clonePermissions = async (req, res) => {
  try {
    const {
      sourceUserId,
      sourceProfileId,
      targetUserId,
      targetProfileId,
      modifiedBy,
    } = req.body;

    if (
      !sourceUserId ||
      !sourceProfileId ||
      !targetUserId ||
      !targetProfileId ||
      !modifiedBy
    ) {
      return res.status(400).json({
        success: false,
        error:
          "sourceUserId, sourceProfileId, targetUserId, targetProfileId, and modifiedBy are required",
      });
    }

    const permissions = await employeePermissionsService.clonePermissions(
      sourceUserId,
      sourceProfileId,
      targetUserId,
      targetProfileId,
      modifiedBy
    );

    res.status(200).json({
      success: true,
      message: "Permissions cloned successfully",
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

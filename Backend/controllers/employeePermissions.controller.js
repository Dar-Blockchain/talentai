const employeePermissionsService = require("../services/employeePermissions.service");

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
 * Create new employee permissions
 * POST /api/employee-permissions
 */
exports.createPermissions = async (req, res) => {
  try {
    const { userId, profileId, ...permissionsData } = req.body;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

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
 * Get permissions for a user and profile
 * GET /api/employee-permissions/:userId/:profileId
 */
exports.getPermissions = async (req, res) => {
  try {
    const { userId, profileId } = req.params;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

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
 * Update permissions
 * PUT /api/employee-permissions/:userId/:profileId
 */
exports.updatePermissions = async (req, res) => {
  try {
    const { userId, profileId } = req.params;
    const { modifiedBy, ...permissionsData } = req.body;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

    if (!modifiedBy) {
      return res.status(400).json({
        success: false,
        error: "modifiedBy is required",
      });
    }

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
 * Delete permissions
 * DELETE /api/employee-permissions/:userId/:profileId
 */
exports.deletePermissions = async (req, res) => {
  try {
    const { userId, profileId } = req.params;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

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
 * Check if user has a specific permission
 * GET /api/employee-permissions/:userId/:profileId/check/:permissionKey
 */
exports.checkPermission = async (req, res) => {
  try {
    const { userId, profileId, permissionKey } = req.params;

    if (!userId || !profileId || !permissionKey) {
      return res.status(400).json({
        success: false,
        error: "userId, profileId, and permissionKey are required",
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
 * Grant permissions to user
 * POST /api/employee-permissions/:userId/:profileId/grant
 */
exports.grantPermissions = async (req, res) => {
  try {
    const { userId, profileId } = req.params;
    const { permissionsToGrant, modifiedBy } = req.body;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

    if (!Array.isArray(permissionsToGrant) || permissionsToGrant.length === 0) {
      return res.status(400).json({
        success: false,
        error: "permissionsToGrant must be an array with at least one permission",
      });
    }

    if (!modifiedBy) {
      return res.status(400).json({
        success: false,
        error: "modifiedBy is required",
      });
    }

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
 * Revoke permissions from user
 * POST /api/employee-permissions/:userId/:profileId/revoke
 */
exports.revokePermissions = async (req, res) => {
  try {
    const { userId, profileId } = req.params;
    const { permissionsToRevoke, modifiedBy } = req.body;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

    if (!Array.isArray(permissionsToRevoke) || permissionsToRevoke.length === 0) {
      return res.status(400).json({
        success: false,
        error: "permissionsToRevoke must be an array with at least one permission",
      });
    }

    if (!modifiedBy) {
      return res.status(400).json({
        success: false,
        error: "modifiedBy is required",
      });
    }

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
 * Get permission summary
 * GET /api/employee-permissions/:userId/:profileId/summary
 */
exports.getPermissionSummary = async (req, res) => {
  try {
    const { userId, profileId } = req.params;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "userId and profileId are required",
      });
    }

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

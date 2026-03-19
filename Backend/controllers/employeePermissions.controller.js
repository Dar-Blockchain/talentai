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
 * Get membership for authenticated user
 */
const getMembershipForUser = async (userId) => {
  const membership = await CompanyMembershipModel.findOne({ user: userId });
  if (!membership) {
    throw new Error("User has no company membership");
  }
  return membership;
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

    const membership = await getMembershipForUser(userId);

    const permissions = await employeePermissionsService.createPermissions(
      userId,
      membership._id,
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

    const permissions = await employeePermissionsService.getPermissions(
      userId
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
 * Get all permissions by company
 * GET /api/employee-permissions/company/:companyId
 */
exports.getPermissionsByCompany = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "companyId is required",
      });
    }

    const permissions =
      await employeePermissionsService.getPermissionsByCompany(companyId);

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
    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.updatePermissions(
      userId,
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

    const result = await employeePermissionsService.deletePermissions(
      userId
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

    if (!permissionKey) {
      return res.status(400).json({
        success: false,
        error: "permissionKey is required",
      });
    }

    const hasPermission = await employeePermissionsService.hasPermission(
      userId,
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

    if (!Array.isArray(permissionsToGrant) || permissionsToGrant.length === 0) {
      return res.status(400).json({
        success: false,
        error: "permissionsToGrant must be an array with at least one permission",
      });
    }

    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.grantPermissions(
      userId,
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

    if (!Array.isArray(permissionsToRevoke) || permissionsToRevoke.length === 0) {
      return res.status(400).json({
        success: false,
        error: "permissionsToRevoke must be an array with at least one permission",
      });
    }

    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.revokePermissions(
      userId,
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

    const summary = await employeePermissionsService.getPermissionSummary(
      userId
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
  if (!checkAuthentication(req, res)) return;
  
  try {
    const {
      sourceUserId,
      targetUserId,
      targetMembershipId,
    } = req.body;

    if (
      !sourceUserId ||
      !targetUserId ||
      !targetMembershipId
    ) {
      return res.status(400).json({
        success: false,
        error:
          "sourceUserId, targetUserId, and targetMembershipId are required",
      });
    }

    const modifiedBy = req.user._id;

    const permissions = await employeePermissionsService.clonePermissions(
      sourceUserId,
      targetUserId,
      targetMembershipId,
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

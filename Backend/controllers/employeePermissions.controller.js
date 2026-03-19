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
 * Get permissions for a user
 * GET /api/employee-permissions/:userId
 */
exports.getPermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.params.userId;

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
 * Update user's permissions
 * PUT /api/employee-permissions/:userId
 */
exports.updatePermissions = async (req, res) => {
  if (!checkAuthentication(req, res)) return;
  
  try {
    const userId = req.params.userId;
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



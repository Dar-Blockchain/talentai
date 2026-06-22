const employeePermissionsService = require("./employee-permissions.service");
const CompanyMembershipModel = require("./company-membership.model");

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
    const isOwner = req.auth?.role === "Company";

    // Employees cannot edit their own permissions
    if (req.user._id.toString() === userId.toString()) {
      return res.status(403).json({ success: false, error: "You cannot modify your own permissions." });
    }

    // Only the company owner can grant or revoke canManagePermissions
    if ("canManagePermissions" in permissionsData && !isOwner) {
      return res.status(403).json({ success: false, error: "Only the company owner can grant or revoke the Manage Permissions permission." });
    }

    // Get membership for the target user
    const membership = await getMembershipForUser(userId);

    let permissions = await employeePermissionsService.getPermissions(
      userId
    ).catch(() => null);

    // If permissions don't exist, create them first
    if (!permissions) {
      const EmployeePermissionsModel = require("./employee-permissions.model");
      permissions = await EmployeePermissionsModel.create({
        userId,
        membershipId: membership._id,
        ...permissionsData,
        lastModifiedBy: modifiedBy,
      });
    } else {
      // Update existing permissions
      permissions = await employeePermissionsService.updatePermissions(
        userId,
        permissionsData,
        modifiedBy
      );
    }

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      data: permissions,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};


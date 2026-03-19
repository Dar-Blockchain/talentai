const express = require("express");
const router = express.Router();
const employeePermissionsController = require("../controllers/employeePermissions.controller");
const { requireAuthUser } = require("../middleware/auth.middleware");

/**
 * @route   POST /api/employee-permissions
 * @desc    Create new employee permissions
 * @access  Private/Admin
 */
router.post("/", requireAuthUser, employeePermissionsController.createPermissions);

/**
 * @route   GET /api/employee-permissions/available
 * @desc    Get all available permissions
 * @access  Private
 */
router.get("/available", requireAuthUser, employeePermissionsController.getAvailablePermissions);

/**
 * @route   GET /api/employee-permissions
 * @desc    Get permissions for current user
 * @access  Private
 */
router.get("/", requireAuthUser, employeePermissionsController.getPermissions);

/**
 * @route   GET /api/employee-permissions/summary
 * @desc    Get permission summary for current user
 * @access  Private
 */
router.get("/summary", requireAuthUser, employeePermissionsController.getPermissionSummary);

/**
 * @route   GET /api/employee-permissions/check/:permissionKey
 * @desc    Check if current user has a specific permission
 * @access  Private
 */
router.get("/check/:permissionKey", requireAuthUser, employeePermissionsController.checkPermission);

/**
 * @route   PUT /api/employee-permissions
 * @desc    Update current user's permissions
 * @access  Private/Admin
 */
router.put("/", requireAuthUser, employeePermissionsController.updatePermissions);

/**
 * @route   POST /api/employee-permissions/grant
 * @desc    Grant permissions to current user
 * @access  Private/Admin
 */
router.post("/grant", requireAuthUser, employeePermissionsController.grantPermissions);

/**
 * @route   POST /api/employee-permissions/revoke
 * @desc    Revoke permissions from current user
 * @access  Private/Admin
 */
router.post("/revoke", requireAuthUser, employeePermissionsController.revokePermissions);

/**
 * @route   DELETE /api/employee-permissions
 * @desc    Delete current user's permissions
 * @access  Private/Admin
 */
router.delete("/", requireAuthUser, employeePermissionsController.deletePermissions);

module.exports = router;

const express = require("express");
const router = express.Router();
const employeePermissionsController = require("../controllers/employeePermissions.controller");

/**
 * @route   POST /api/employee-permissions
 * @desc    Create new employee permissions
 * @access  Private/Admin
 */
router.post("/", employeePermissionsController.createPermissions);

/**
 * @route   GET /api/employee-permissions/available
 * @desc    Get all available permissions
 * @access  Private
 */
router.get("/available", employeePermissionsController.getAvailablePermissions);

/**
 * @route   GET /api/employee-permissions/:userId/:profileId
 * @desc    Get permissions for a user and profile
 * @access  Private
 */
router.get("/:userId/:profileId", employeePermissionsController.getPermissions);

/**
 * @route   GET /api/employee-permissions/:userId/:profileId/summary
 * @desc    Get permission summary for user
 * @access  Private
 */
router.get("/:userId/:profileId/summary", employeePermissionsController.getPermissionSummary);

/**
 * @route   GET /api/employee-permissions/:userId/:profileId/check/:permissionKey
 * @desc    Check if user has a specific permission
 * @access  Private
 */
router.get("/:userId/:profileId/check/:permissionKey", employeePermissionsController.checkPermission);

/**
 * @route   GET /api/employee-permissions/profile/:profileId
 * @desc    Get all permissions by profile
 * @access  Private/Admin
 */
router.get("/profile/:profileId", employeePermissionsController.getPermissionsByProfile);

/**
 * @route   GET /api/employee-permissions/user/:userId
 * @desc    Get all permissions by user
 * @access  Private/Admin
 */
router.get("/user/:userId", employeePermissionsController.getPermissionsByUser);

/**
 * @route   PUT /api/employee-permissions/:userId/:profileId
 * @desc    Update permissions
 * @access  Private/Admin
 */
router.put("/:userId/:profileId", employeePermissionsController.updatePermissions);

/**
 * @route   POST /api/employee-permissions/:userId/:profileId/grant
 * @desc    Grant permissions to user
 * @access  Private/Admin
 */
router.post("/:userId/:profileId/grant", employeePermissionsController.grantPermissions);

/**
 * @route   POST /api/employee-permissions/:userId/:profileId/revoke
 * @desc    Revoke permissions from user
 * @access  Private/Admin
 */
router.post("/:userId/:profileId/revoke", employeePermissionsController.revokePermissions);

/**
 * @route   POST /api/employee-permissions/clone
 * @desc    Clone permissions from one user to another
 * @access  Private/Admin
 */
router.post("/clone", employeePermissionsController.clonePermissions);

/**
 * @route   DELETE /api/employee-permissions/:userId/:profileId
 * @desc    Delete permissions
 * @access  Private/Admin
 */
router.delete("/:userId/:profileId", employeePermissionsController.deletePermissions);

module.exports = router;

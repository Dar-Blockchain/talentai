const express = require("express");
const router = express.Router();
const employeePermissionsController = require("../controllers/employeePermissions.controller");
const { requireAuthUser } = require("../middleware/auth.middleware");

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
 * @route   PUT /api/employee-permissions
 * @desc    Update current user's permissions
 * @access  Private/Admin
 */
router.put("/", requireAuthUser, employeePermissionsController.updatePermissions);

module.exports = router;

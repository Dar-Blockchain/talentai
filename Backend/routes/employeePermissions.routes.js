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
 * @route   GET /api/employee-permissions/:userId
 * @desc    Get permissions for a user
 * @access  Private
 */
router.get("/:userId", requireAuthUser, employeePermissionsController.getPermissions);

/**
 * @route   PUT /api/employee-permissions/:userId
 * @desc    Update user's permissions
 * @access  Private/Admin
 */
router.put("/:userId", requireAuthUser, employeePermissionsController.updatePermissions);

module.exports = router;

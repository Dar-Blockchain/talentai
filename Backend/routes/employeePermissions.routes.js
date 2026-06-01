const express = require("express");
const router = express.Router();
const employeePermissionsController = require("../controllers/employeePermissions.controller");
const { requireAuthUser } = require("../middleware/security/auth.middleware");

/**
 * @openapi
 * /employee-permissions/available:
 *   get:
 *     tags: [Employee Permissions]
 *     summary: List all available permission keys
 *     responses:
 *       200:
 *         description: Array of available permissions
 */
router.get("/available", requireAuthUser, employeePermissionsController.getAvailablePermissions);

/**
 * @openapi
 * /employee-permissions/{userId}:
 *   get:
 *     tags: [Employee Permissions]
 *     summary: Get permissions for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User's permissions
 */
router.get("/:userId", requireAuthUser, employeePermissionsController.getPermissions);

/**
 * @openapi
 * /employee-permissions/{userId}:
 *   put:
 *     tags: [Employee Permissions]
 *     summary: Update permissions for a user (Admin/Company)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Permissions updated
 */
router.put("/:userId", requireAuthUser, employeePermissionsController.updatePermissions);

module.exports = router;

/**
 * Company Permissions Routes
 * Routes for managing company permissions (Admin only)
 *
 * Middlewares applied:
 * - requireAuthUser: requires authenticated user
 * - controledAcces('Admin'): restricts to administrators only
 */
const express = require("express");
const router = express.Router();
const companyPermissionsController = require("../controllers/companyPermissions.controller");

// Import middlewares
const { requireAuth } = require("../middleware/security/auth.middleware");
const { controledAcces } = require('../middleware/authorize.middleware.js');

// All routes require admin authentication
router.use(requireAuth, controledAcces('Admin'));

/**
 * @openapi
 * /admin/companies/{companyId}/permissions:
 *   get:
 *     tags: [Admin — Company Permissions]
 *     summary: Get permissions for a company (Admin)
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company permissions object
 *       403:
 *         description: Admin role required
 */
router.get("/companies/:companyId/permissions", companyPermissionsController.getCompanyPermissions);

/**
 * @openapi
 * /admin/companies/{companyId}/permissions:
 *   post:
 *     tags: [Admin — Company Permissions]
 *     summary: Update permissions for a company (Admin)
 *     parameters:
 *       - in: path
 *         name: companyId
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
 *                 properties:
 *                   canCreateJobPosts: { type: boolean }
 *     responses:
 *       200:
 *         description: Permissions updated
 */
router.post("/companies/:companyId/permissions", companyPermissionsController.updateCompanyPermissions);

module.exports = router;

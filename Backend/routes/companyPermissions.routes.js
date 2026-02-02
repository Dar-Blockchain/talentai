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
const { requireAuthUser } = require("../middleware/authMiddleware");
const { controledAcces } = require('../middleware/controledAcces');

// All routes require admin authentication
router.use(requireAuthUser, controledAcces('Admin'));

// GET /admin/companies/:companyId/permissions
// Description: Retrieve permissions for a specific company
router.get("/companies/:companyId/permissions", companyPermissionsController.getCompanyPermissions);

// POST /admin/companies/:companyId/permissions
// Description: Update permissions for a specific company
// Body: { permissions: { canCreateJobPosts: boolean, ... } }
router.post("/companies/:companyId/permissions", companyPermissionsController.updateCompanyPermissions);

module.exports = router;

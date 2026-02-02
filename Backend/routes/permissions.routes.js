/**
 * Permissions Routes
 * Routes for users to fetch their own permissions
 *
 * Middlewares applied:
 * - requireAuthUser: requires authenticated user
 */
const express = require("express");
const router = express.Router();
const companyPermissionsController = require("../controllers/companyPermissions.controller");

// Import middlewares
const { requireAuthUser } = require("../middleware/authMiddleware");

// GET /permissions/me
// Description: Get current user's own permissions
router.get("/me", requireAuthUser, companyPermissionsController.getMyPermissions);

module.exports = router;

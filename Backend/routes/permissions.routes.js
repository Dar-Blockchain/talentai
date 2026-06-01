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
const { requireAuth } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

router.use(requireAuth);

/**
 * @openapi
 * /permissions/me:
 *   get:
 *     tags: [Permissions]
 *     summary: Get current user's own permissions
 *     responses:
 *       200:
 *         description: Permissions object for the authenticated user
 */
router.get("/me", companyPermissionsController.getMyPermissions);

module.exports = router;

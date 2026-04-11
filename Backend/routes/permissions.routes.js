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
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

router.use((req, res, next) => {
  // First try API Key verification
  verifyApiKey(req, res, (err) => {
    // If API Key succeeds, continue
    if (req.isApiKeyAuth) {
      return next();
    }
    // Otherwise, require JWT authentication
    return requireAuthUser(req, res, next);
  });
});

// GET /permissions/me
// Description: Get current user's own permissions
router.get("/me", companyPermissionsController.getMyPermissions);

module.exports = router;

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/security/auth.middleware");
const apiKeyController = require("../controllers/apiKey.controller");

// All API Key routes require user authentication
router.use(requireAuth);

/**
 * POST /api/api-keys
 * Create a new API key
 * Body: { name, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist? }
 */
router.post("/", apiKeyController.createApiKey);

/**
 * GET /api/api-keys
 * List all API keys for the user
 */
router.get("/", apiKeyController.listApiKeys);

/**
 * GET /api/api-keys/:id
 * Get details of an API key
 */
router.get("/:id", apiKeyController.getApiKeyDetails);

/**
 * PUT /api/api-keys/:id
 * Update an API key
 * Body: { name?, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist?, isActive? }
 */
router.put("/:id", apiKeyController.updateApiKey);

/**
 * PATCH /api/api-keys/:id/toggle
 * Disable/re-enable an API key
 */
router.patch("/:id/toggle", apiKeyController.toggleApiKey);

/**
 * POST /api/api-keys/:id/regenerate
 * Regenerate an API key (create a new one)
 */
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);

/**
 * DELETE /api/api-keys/:id
 * Delete an API key
 */
router.delete("/:id", apiKeyController.deleteApiKey);

module.exports = router;

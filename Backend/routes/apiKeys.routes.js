const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/security/auth.middleware");
const apiKeyController = require("../controllers/apiKeys.controller");

// All API Key routes require user authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/api-keys:
 *   post:
 *     tags: [API Keys]
 *     summary: Create a new API key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               serviceName: { type: string }
 *               scopes:
 *                 type: array
 *                 items: { type: string }
 *               rateLimit: { type: integer }
 *               expiresAt: { type: string, format: date-time }
 *               ipWhitelist:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: API key created (plaintext key returned only once)
 *   get:
 *     tags: [API Keys]
 *     summary: List all API keys for the authenticated user
 *     responses:
 *       200:
 *         description: List of API keys (secrets masked)
 */
router.post("/", apiKeyController.createApiKey);
router.get("/", apiKeyController.listApiKeys);

/**
 * @openapi
 * /api/api-keys/{id}:
 *   get:
 *     tags: [API Keys]
 *     summary: Get details of an API key
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: API key details
 *   put:
 *     tags: [API Keys]
 *     summary: Update an API key
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               serviceName: { type: string }
 *               scopes: { type: array, items: { type: string } }
 *               rateLimit: { type: integer }
 *               expiresAt: { type: string, format: date-time }
 *               ipWhitelist: { type: array, items: { type: string } }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: API key updated
 *   delete:
 *     tags: [API Keys]
 *     summary: Delete an API key
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: API key deleted
 */
router.get("/:id", apiKeyController.getApiKeyDetails);
router.put("/:id", apiKeyController.updateApiKey);
router.delete("/:id", apiKeyController.deleteApiKey);

/**
 * @openapi
 * /api/api-keys/{id}/toggle:
 *   patch:
 *     tags: [API Keys]
 *     summary: Enable or disable an API key
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Toggle applied
 */
router.patch("/:id/toggle", apiKeyController.toggleApiKey);

/**
 * @openapi
 * /api/api-keys/{id}/regenerate:
 *   post:
 *     tags: [API Keys]
 *     summary: Regenerate an API key (issues a new secret)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: New key returned (plaintext, shown only once)
 */
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);

module.exports = router;

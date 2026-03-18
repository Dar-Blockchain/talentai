const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/auth.middleware");
const apiKeyController = require("../controllers/ApiKey.controller");

// Toutes les routes API Key nécessitent une authentification utilisateur
router.use(requireAuthUser);

/**
 * POST /api/api-keys
 * Créer une nouvelle clé API
 * Body: { name, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist? }
 */
router.post("/", apiKeyController.createApiKey);

/**
 * GET /api/api-keys
 * Lister toutes les clés API de l'utilisateur
 */
router.get("/", apiKeyController.listApiKeys);

/**
 * GET /api/api-keys/:id
 * Obtenir les détails d'une clé API
 */
router.get("/:id", apiKeyController.getApiKeyDetails);

/**
 * PUT /api/api-keys/:id
 * Mettre à jour une clé API
 * Body: { name?, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist?, isActive? }
 */
router.put("/:id", apiKeyController.updateApiKey);

/**
 * PATCH /api/api-keys/:id/toggle
 * Désactiver/réactiver une clé API
 */
router.patch("/:id/toggle", apiKeyController.toggleApiKey);

/**
 * POST /api/api-keys/:id/regenerate
 * Régénérer une clé API (créer une nouvelle)
 */
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);

/**
 * DELETE /api/api-keys/:id
 * Supprimer une clé API
 */
router.delete("/:id", apiKeyController.deleteApiKey);

module.exports = router;

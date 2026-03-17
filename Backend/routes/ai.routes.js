/**
 * Routes pour les interactions avec les agents IA
 *
 * Ces routes permettent aux agents IA d'interagir avec les APIs
 * de manière structurée via des outils.
 */

const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");

const aiController = require("../controllers/ai.controller");

// Routes publiques pour la découverte
router.get("/health", aiController.healthCheck);
router.get("/tools", aiController.getAvailableTools);

// Routes authentifiées pour l'exécution
router.use(requireAuthUser, authLogMiddleware("AI"));

// POST /ai/execute-tool
// Description: Exécuter un outil IA spécifique
// Body: { toolName: string, parameters: object }
router.post("/execute-tool", aiController.executeTool);

module.exports = router;
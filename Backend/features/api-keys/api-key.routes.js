const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middleware/security/auth.middleware");
const apiKeyController = require("./api-key.controller");

router.use(requireAuth);

router.post("/", apiKeyController.createApiKey);
router.get("/", apiKeyController.listApiKeys);
router.get("/:id", apiKeyController.getApiKeyDetails);
router.put("/:id", apiKeyController.updateApiKey);
router.delete("/:id", apiKeyController.deleteApiKey);
router.patch("/:id/toggle", apiKeyController.toggleApiKey);
router.post("/:id/regenerate", apiKeyController.regenerateApiKey);

module.exports = router;

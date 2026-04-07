const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, addConfig } = require('../controllers/MatchingController/MatchingConfig.controller');

// Import des middlewares
const { requireAuthUser } = require('../middleware/auth.middleware');
const { controledAcces } = require('../middleware/authorize.middleware.js');
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// Toutes les routes ci-dessous nécessitent un admin authentifié
router.use(requireAuthUser,resolveCompanyActor, authLogMiddleware("MatchingConfig"));

router.get('/', getConfig);
router.post('/', addConfig);
router.put('/', updateConfig);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, addConfig } = require('../controllers/MatchingController/MatchingConfig.controller');

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const resolveCompanyActor = require("../middleware/resolveCompanyActor");


// Toutes les routes ci-dessous nécessitent un admin authentifié
router.use(requireAuthUser,resolveCompanyActor, authLogMiddleware("MatchingConfig"));

router.get('/', getConfig);
router.post('/', addConfig);
router.put('/', updateConfig);

module.exports = router;

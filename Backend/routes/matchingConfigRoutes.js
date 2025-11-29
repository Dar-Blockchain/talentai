const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/MatchingController/MatchingConfigController');

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Toutes les routes ci-dessous nécessitent un admin authentifié
router.use(requireAuthUser, controledAcces('Admin'), authLogMiddleware("MatchingConfig"));

router.get('/', getConfig);
router.put('/', updateConfig);

module.exports = router;

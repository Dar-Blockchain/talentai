/**
 * Post steps routes (workflow and nodes)
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 */
const express = require('express');
const router = express.Router();
const postStepsController = require('../controllers/PostControllers/postSteps.controller');
const {requireAuth} = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware")

router.use(requireAuth, authLogMiddleware("PostSteps"));

module.exports = router;

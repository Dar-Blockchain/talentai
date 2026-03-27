/**
 * Routes for generating LinkedIn posts for companies
 *
 * Global middlewares applied:
 * - requireAuthUser: requires an authenticated user
 * - controledAcces('Company'): reserved for Company accounts
 * - LogMiddleware("LinkedinPost"): logs LinkedIn requests
 */
const express = require("express");
const router = express.Router();
const generateJobPostController = require("../controllers/PostControllers/generateJobPost.controller");


// Import des middlewares
const { requireAuthUser } = require("../middleware/auth.middleware");
const { controledAcces } = require('../middleware/authorize.middleware.js'); 
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");


// All routes below require an authenticated Company account
router.use(requireAuthUser, controledAcces('Company'), authLogMiddleware("LinkedinPost"));


// POST /linkedin/generate-job-post
// Body: { title, description, skills, ... }
// Description: Generates an attractive LinkedIn post for a job offer
router.post("/generate-job-post", resolveCompanyActor,generateJobPostController.generateJobPost);

module.exports = router;

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
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const { verifyApiKey } = require("../middleware/security/api-key.middleware");
const { controledAcces } = require('../middleware/authorize.middleware.js'); 
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");


// All routes below: accept either API Key or JWT authentication, then verify Company access
router.use((req, res, next) => {
  // First try API Key verification
  verifyApiKey(req, res, (err) => {
    // If API Key succeeds, continue
    if (req.isApiKeyAuth) {
      return next();
    }
    // Otherwise, require JWT authentication
    return requireAuthUser(req, res, next);
  });
});

// Apply Company-specific middlewares after authentication
router.use(controledAcces('Company'), authLogMiddleware("LinkedinPost"));


// POST /linkedin/generate-job-post
// Body: { title, description, skills, ... }
// Description: Generates an attractive LinkedIn post for a job offer
router.post("/generate-job-post", resolveCompanyActor,generateJobPostController.generateJobPost);

module.exports = router;

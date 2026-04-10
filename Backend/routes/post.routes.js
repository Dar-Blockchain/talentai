/**
 * Post (job offers) routes
 *
 * Global middlewares applied:
 * - requireAuthUser: requires an authenticated user
 * - verifyApiKey: alternative for API key authentication
 * - LogMiddleware("Post"): logs post-related requests
 * - controledAcces: some routes may require a specific role on the controller side
 */
const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

// Import des middlewares
const postController = require("../controllers/PostControllers/post.controller");
const postPaymentController = require("../controllers/postPayment.controller");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// Public routes - no authentication required

// GET /post/search
// Description: Returns all posts with search, filters and pagination (public)
router.get("/search", postController.getAllPostsWithSearch);

// GET /post/details/:id
// Description: Returns post details by ID (public)
router.get("/details/:id", postController.getPostDetailsPublic);

// GET /post/public-stats
// Description: Returns public statistics (number of users, posts, companies)
router.get("/public-stats", postController.getPublicStats);

// Auth required + logs for all routes
// Accepts either JWT (requireAuthUser) or API key (verifyApiKey)
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

router.use(authLogMiddleware("Post"));

// POST /post/save-post
// Description: Creates a post
// Required scopes: write:posts
router.post("/save-post", checkScope(['write:posts']), resolveCompanyActor, postController.createPost);

// GET /post/get-all-posts
// Description: Returns all posts
// Required scopes: read:posts
router.get("/get-all-posts", checkScope(['read:posts']), postController.getAllPosts);

// GET /post/my-posts
// Description: Posts of current user
// Required scopes: read:posts
router.get("/my-posts", checkScope(['read:posts']), resolveCompanyActor, postController.getUserPosts);

// GET /post/metrics
// Description: Returns post metrics (total, active, draft, expired, closed, cancelled)
router.get("/metrics", postController.getPostMetrics);

// GET /post/getPostById/:id
// Description: Post details
// Required scopes: read:posts
router.get("/getPostById/:id", checkScope(['read:posts']), postController.getPostById);

// PUT /post/updatePost/:id
// Description: Updates a post
// Required scopes: write:posts
router.put("/updatePost/:id", checkScope(['write:posts']), resolveCompanyActor,postController.updatePost);

// PATCH /post/updatePostStatus/:id
// Description: Changes post status (active/draft, etc.)
// Required scopes: write:posts
router.patch("/updatePostStatus/:id", checkScope(['write:posts']), resolveCompanyActor,postController.updatePostStatus);

// DELETE /post/deletePost/:id
// Description: Deletes a post
// Required scopes: delete:posts
router.delete("/deletePost/:id", checkScope(['delete:posts']), resolveCompanyActor,postController.deletePost);

// GET /post/adsPost
// Description: 3 posts suggested from top 3 profile skills + pagination
router.get("/adsPost", postController.getPostsByUserTopSkills);

// GET /post/DetailsPost/:id
// Description: Post detail alias
router.get("/DetailsPost/:id", resolveCompanyActor,postController.getPostById);

// POST /post/send-technical-test
// Description: Send technical test task via email with PDF
router.post("/send-technical-test", resolveCompanyActor,postController.sendTechnicalTest);

// ========================================
// PAYMENT ROUTES
// ========================================

// GET /post/payment/calculate-price/:postId
// Description: Calculate payment price for a post based on number of steps
router.get("/payment/calculate-price/:postId", resolveCompanyActor,postPaymentController.calculatePostPrice);

// POST /post/payment/process
// Description: Process payment for agent creation after post and agent are created
// Body: { postId, agentId }
// Required scopes: write:posts
router.post("/payment/process", checkScope(['write:posts']), resolveCompanyActor,postPaymentController.processPostPayment);

// GET /post/payment/history
// Description: Get payment history for user's posts
router.get("/payment/history", resolveCompanyActor,postPaymentController.getPostPaymentHistory);

// GET /post/payment/details/:postId
// Description: Get payment details for a specific post
router.get("/payment/details/:postId", resolveCompanyActor,postPaymentController.getPostPaymentDetails);

// GET /post/interview-config/:jobId
// Description: Get interview configuration for job-based HR interview (prompt flow)
router.get("/interview-config/:jobId",resolveCompanyActor, postController.getJobInterviewConfig);

module.exports = router;

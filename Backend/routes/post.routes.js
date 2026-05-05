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
const { requireAuth } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");
const generateJobPostController = require("../controllers/PostControllers/generateJobPost.controller");

// Import des middlewares
const postController = require("../controllers/PostControllers/post.controller");
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


router.use(requireAuth,authLogMiddleware("Post"));

router.post("/generate-job-post",controledAcces('Company'), resolveCompanyActor,generateJobPostController.generateJobPost);

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
router.get("/my-posts", resolveCompanyActor, postController.getUserPosts);

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

// ========================================
// INTERVIEW CONFIGURATION ROUTES
// ========================================

// GET /post/interview-config/:jobId
// Description: Get interview configuration for job-based HR interview (prompt flow)
router.get("/interview-config/:jobId",resolveCompanyActor, postController.getJobInterviewConfig);

module.exports = router;

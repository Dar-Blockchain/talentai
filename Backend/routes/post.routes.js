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
const multer = require("multer");
const path = require("path");
const { requireAuth } = require("../middleware/security/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");
const generateJobPostController = require("../controllers/PostControllers/generateJobPost.controller");

// Import des middlewares
const postController = require("../controllers/PostControllers/post.controller");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// Configure multer for file upload
const upload = multer({
  dest: path.join(__dirname, "../uploads/temp/"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".json", ".csv", ".txt"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file format. Allowed: JSON, CSV, TXT"));
    }
  },
});

/**
 * @openapi
 * /post/search:
 *   get:
 *     tags: [Posts]
 *     summary: Search / list all posts (public)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of posts
 */
router.get("/search", postController.getAllPostsWithSearch);

/**
 * @openapi
 * /post/details/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post details by ID (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get("/details/:id", postController.getPostDetailsPublic);

/**
 * @openapi
 * /post/public-stats:
 *   get:
 *     tags: [Posts]
 *     summary: Public platform statistics (users, posts, companies)
 *     security: []
 *     responses:
 *       200:
 *         description: Aggregated counts
 */
router.get("/public-stats", postController.getPublicStats);


router.use(requireAuth,authLogMiddleware("Post"));

/**
 * @openapi
 * /post/generate-job-post:
 *   post:
 *     tags: [Posts]
 *     summary: AI-generate a job post draft (Company only)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               jobTitle: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Generated job post draft
 */
router.post("/generate-job-post", upload.single("file"), controledAcces('Company'), resolveCompanyActor, generateJobPostController.generateJobPost);

/**
 * @openapi
 * /post/save-post:
 *   post:
 *     tags: [Posts]
 *     summary: Create a job post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobDetails]
 *             properties:
 *               jobDetails:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [draft, open]
 *     responses:
 *       201:
 *         description: Post created
 */
router.post("/save-post", checkScope(['write:posts']), resolveCompanyActor, postController.createPost);

/**
 * @openapi
 * /post/get-all-posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/get-all-posts", checkScope(['read:posts']), postController.getAllPosts);

/**
 * @openapi
 * /post/my-posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get posts belonging to current user/company
 *     responses:
 *       200:
 *         description: List of user's posts
 */
router.get("/my-posts", resolveCompanyActor, postController.getUserPosts);

/**
 * @openapi
 * /post/metrics:
 *   get:
 *     tags: [Posts]
 *     summary: Post metrics (total, active, draft, expired, closed, cancelled)
 *     responses:
 *       200:
 *         description: Post metrics
 */
router.get("/metrics", resolveCompanyActor, postController.getPostMetrics);

/**
 * @openapi
 * /post/kpi/status-by-post:
 *   get:
 *     tags: [Posts]
 *     summary: KPI — per-post shortlisted / velocity / coverage / deadline
 *     responses:
 *       200:
 *         description: KPI data per post
 */
router.get("/kpi/status-by-post", postController.getPostsStatusKPI);

/**
 * @openapi
 * /post/getPostById/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Get post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Not found
 */
router.get("/getPostById/:id", checkScope(['read:posts']), postController.getPostById);

/**
 * @openapi
 * /post/updatePost/{id}:
 *   put:
 *     tags: [Posts]
 *     summary: Update a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Post updated
 */
router.put("/updatePost/:id", checkScope(['write:posts']), resolveCompanyActor,postController.updatePost);

/**
 * @openapi
 * /post/updatePostStatus/{id}:
 *   patch:
 *     tags: [Posts]
 *     summary: Change post status (open, draft, closed …)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, open, closed, cancelled, expired]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/updatePostStatus/:id", checkScope(['write:posts']), resolveCompanyActor,postController.updatePostStatus);

/**
 * @openapi
 * /post/deletePost/{id}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post deleted
 */
router.delete("/deletePost/:id", checkScope(['delete:posts']), resolveCompanyActor,postController.deletePost);

/**
 * @openapi
 * /post/adsPost:
 *   get:
 *     tags: [Posts]
 *     summary: Suggested posts based on user's top 3 skills
 *     responses:
 *       200:
 *         description: List of suggested posts
 */
router.get("/adsPost", postController.getPostsByUserTopSkills);

/**
 * @openapi
 * /post/DetailsPost/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Post detail alias
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post details
 */
router.get("/DetailsPost/:id", resolveCompanyActor,postController.getPostById);

/**
 * @openapi
 * /post/interview-config/{jobId}:
 *   get:
 *     tags: [Posts]
 *     summary: Get interview configuration for a job post
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Interview configuration (prompt flow)
 */
router.get("/interview-config/:jobId",resolveCompanyActor, postController.getJobInterviewConfig);

module.exports = router;

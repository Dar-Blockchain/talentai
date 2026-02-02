/**
 * Routes des offres (posts)
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Post"): journalise les requêtes liées aux posts
 * - controledAcces: certaines routes peuvent nécessiter un rôle spécifique côté contrôleur
 */
const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/auth.middleware");

// Import des middlewares
const postController = require("../controllers/PostControllers/post.controller");
const postPaymentController = require("../controllers/postPayment.controller");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// Public routes - no authentication required

// GET /post/search
// Description: Retourne tous les posts avec recherche, filtres et pagination (public)
router.get("/search", postController.getAllPostsWithSearch);

// GET /post/details/:id
// Description: Retourne les détails d'un post par son ID (public)
router.get("/details/:id", postController.getPostDetailsPublic);

// GET /post/public-stats
// Description: Retourne les statistiques publiques (nombre d'utilisateurs, posts, entreprises)
router.get("/public-stats", postController.getPublicStats);

// Auth obligatoire + logs pour toutes les routes
router.use(requireAuthUser, authLogMiddleware("Post"));


// POST /post/save-post
// Description: Crée un post
router.post("/save-post",resolveCompanyActor, postController.createPost);

// GET /post/get-all-posts
// Description: Retourne tous les posts
router.get("/get-all-posts", postController.getAllPosts);

// GET /post/my-posts
// Description: Posts de l'utilisateur courant
router.get("/my-posts", resolveCompanyActor, postController.getUserPosts);


// GET /post/getPostById/:id
// Description: Détails d'un post
router.get("/getPostById/:id", postController.getPostById);

// PUT /post/updatePost/:id
// Description: Met à jour un post
router.put("/updatePost/:id", resolveCompanyActor,postController.updatePost);

// PATCH /post/updatePostStatus/:id
// Description: Modifie le statut d'un post (actif/brouillon, etc.)
router.patch("/updatePostStatus/:id", resolveCompanyActor,postController.updatePostStatus);

// DELETE /post/deletePost/:id
// Description: Supprime un post
router.delete("/deletePost/:id", resolveCompanyActor,postController.deletePost);

// GET /post/adsPost
// Description: 3 posts proposés à partir des 3 premières compétences du profil + pagination
router.get("/adsPost", postController.getPostsByUserTopSkills);

// GET /post/DetailsPost/:id
// Description: Alias de détail de post
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
router.post("/payment/process", resolveCompanyActor,postPaymentController.processPostPayment);

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

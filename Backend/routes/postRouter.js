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
const { requireAuthUser } = require("../middleware/authMiddleware");

// Import des middlewares
const postController = require("../controllers/postController");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware

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
router.use(requireAuthUser);
//router.use(requireAuthUser, authLogMiddleware("Post"));


// POST /post/save-post
// Description: Crée un post
router.post("/save-post", postController.createPost);

// GET /post/get-all-posts
// Description: Retourne tous les posts
router.get("/get-all-posts", postController.getAllPosts);

// GET /post/my-posts
// Description: Posts de l'utilisateur courant
router.get("/my-posts", postController.getUserPosts);

// GET /post/user/:userId
// Description: Posts d'un utilisateur spécifique
router.get("/user/:userId", postController.getUserPosts);

// GET /post/getPostById/:id
// Description: Détails d'un post
router.get("/getPostById/:id", postController.getPostById);

// PUT /post/updatePost/:id
// Description: Met à jour un post
router.put("/updatePost/:id", postController.updatePost);

// PATCH /post/updatePostStatus/:id
// Description: Modifie le statut d'un post (actif/brouillon, etc.)
router.patch("/updatePostStatus/:id", postController.updatePostStatus);

// DELETE /post/deletePost/:id
// Description: Supprime un post
router.delete("/deletePost/:id", postController.deletePost);

// GET /post/adsPost
// Description: 3 posts proposés à partir des 3 premières compétences du profil
router.get("/adsPost", postController.getPostsByUserTopSkills);

// GET /post/DetailsPost/:id
// Description: Alias de détail de post
router.get("/DetailsPost/:id", postController.getPostById);

// POST /post/send-technical-test
// Description: Send technical test task via email with PDF
router.post("/send-technical-test", postController.sendTechnicalTest);

module.exports = router;

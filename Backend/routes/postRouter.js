const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

// Routes protégées par authentification
router.use(requireAuthUser);

// Route pour créer un post
router.post("/save-post",authLogMiddleware('Post'), postController.createPost);

// Route pour récupérer tous les posts
router.get("/get-all-posts",authLogMiddleware('Post'), postController.getAllPosts);

// Route pour récupérer les posts de l'utilisateur connecté
router.get("/my-posts",authLogMiddleware('Post'), postController.getUserPosts);

// Route pour récupérer les posts d'un utilisateur spécifique
router.get("/user/:userId",authLogMiddleware('Post'), postController.getUserPosts);

// Route pour récupérer un post spécifique
router.get("/getPostById/:id",authLogMiddleware('Post'), postController.getPostById);

// Route pour mettre à jour un post
router.put("/updatePost/:id",authLogMiddleware('Post'), postController.updatePost);

// Route pour changer le statut d'un post
router.patch("/updatePostStatus/:id",authLogMiddleware('Post'), postController.updatePostStatus);

// Route pour supprimer un post
router.delete("/deletePost/:id",authLogMiddleware('Post'), postController.deletePost);

module.exports = router;

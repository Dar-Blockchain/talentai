const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/authMiddleware");
const postController = require("../controllers/postController");

// Routes protégées par authentification
router.use(requireAuthUser);

// Route pour créer un post
router.post("/save-post", postController.createPost);

// Route pour récupérer tous les posts
router.get("/get-all-posts", postController.getAllPosts);

// Route pour récupérer les posts de l'utilisateur connecté
router.get("/my-posts", postController.getUserPosts);

// Route pour récupérer les posts d'un utilisateur spécifique
router.get("/user/:userId", postController.getUserPosts);

// Route pour récupérer un post spécifique
router.get("/getPostById/:id", postController.getPostById);

// Route pour mettre à jour un post
router.put("/updatePost/:id", postController.updatePost);

// Route pour changer le statut d'un post
router.patch("/updatePostStatus/:id", postController.updatePostStatus);

// Route pour supprimer un post
router.delete("/deletePost/:id", postController.deletePost);

module.exports = router;

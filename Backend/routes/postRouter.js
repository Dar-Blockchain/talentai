const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  updatePostStatus
} = require('../controllers/postController');

// Routes protégées par authentification
router.use(authenticateToken);

// Route pour créer un post
router.post('/', createPost);

// Route pour récupérer tous les posts
router.get('/', getAllPosts);

// Route pour récupérer les posts de l'utilisateur connecté
router.get('/my-posts', getUserPosts);

// Route pour récupérer les posts d'un utilisateur spécifique
router.get('/user/:userId', getUserPosts);

// Route pour récupérer un post spécifique
router.get('/:id', getPostById);

// Route pour mettre à jour un post
router.put('/:id', updatePost);

// Route pour changer le statut d'un post
router.patch('/:id/status', updatePostStatus);

// Route pour supprimer un post
router.delete('/:id', deletePost);

module.exports = router; 
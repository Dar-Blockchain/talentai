const postService = require('../services/postService');

// Créer un nouveau post
exports.createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      user: req.user._id
    };
    
    const post = await postService.createPost(postData);
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer tous les posts
exports.getAllPosts = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    const posts = await postService.getAllPosts(filters);
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer un post par son ID
exports.getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
};

// Récupérer les posts d'un utilisateur
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const posts = await postService.getPostsByUserId(userId);
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Mettre à jour un post
exports.updatePost = async (req, res) => {
  try {
    const post = await postService.updatePost(
      req.params.id,
      req.user._id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Changer le statut d'un post
exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['drafts', 'posted', 'scheduled'].includes(status)) {
      throw new Error('Invalid status');
    }
    
    const post = await postService.updatePostStatus(
      req.params.id,
      req.user._id,
      status
    );
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 
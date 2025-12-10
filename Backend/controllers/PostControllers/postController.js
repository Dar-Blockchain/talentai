const { POST_STATUS } = require("../../constants/postConstants");
const postService = require("../../services/PosteServices/postService");
const { sendPostEmail } = require("../../utils/mailing");
const matchingConfigService = require("../../services/MatchingService/matchingConfigService");

// Créer un nouveau post
exports.createPost = async (req, res) => {
  try {
    // Normalize body: if `skillAnalysis` (or its children) was sent as a JSON string
    // (common when using form-data), parse it so Mongoose receives proper objects/arrays.
    const incoming = { ...req.body };
    try {
      if (typeof incoming.skillAnalysis === 'string') {
        incoming.skillAnalysis = JSON.parse(incoming.skillAnalysis);
      }
      // If matchingConfig was sent as JSON string (form-data), parse it too
      if (typeof incoming.matchingConfig === 'string') {
        incoming.matchingConfig = JSON.parse(incoming.matchingConfig);
      }
    } catch (parseErr) {
      // If parsing fails, return a clear error to the client
      return res.status(400).json({ success: false, error: 'Invalid JSON in skillAnalysis field' });
    }

    const postData = {
      ...incoming,
      user: req.user._id,
    };

    // Get token from Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");

    const post = await postService.createPost(postData, token);

    // If a matching config was provided in the request, create it and link to the post
    let createdMatchingConfig = null;
    if (incoming.matchingConfig) {
      try {
        const cfgPayload = { ...incoming.matchingConfig, jobId: post._id };
        createdMatchingConfig = await matchingConfigService.addConfig(req.user._id, cfgPayload);
      } catch (cfgErr) {
        // Log error but do not fail the main request — post creation succeeded
        console.error('Error creating matching config for post', post._id, cfgErr.message || cfgErr);
      }
    }
    res.status(201).json({
      success: true,
      data: post,
      matchingConfig: createdMatchingConfig,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
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
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer tous les posts avec recherche, filtres et pagination
exports.getAllPostsWithSearch = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      search,
      location,
      type,
      employmentType,
      status, // Removed default "active" to show all posts
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build filters object
    const filters = {
      search,
      location,
      type,
      employmentType,
      status,
      category,
      sortBy,
      sortOrder,
    };

    // Get posts from service
    const result = await postService.getAllPostsWithSearch(filters, pageNum, limitNum);

    res.status(200).json({
      success: true,
      results: result.posts,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages,
      hasNextPage: result.pagination.hasNextPage,
      hasPrevPage: result.pagination.hasPrevPage,
      filters: {
        search,
        location,
        type,
        employmentType,
        status,
        category,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error in getAllPostsWithSearch controller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch posts",
    });
  }
};

// Récupérer les détails d'un post par son ID (public, no auth required)
exports.getPostDetailsPublic = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    
    console.log('📄 Public job details requested for ID:', req.params.id);
    
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('❌ Error fetching public job details:', error);
    res.status(404).json({
      success: false,
      error: error.message || 'Job not found',
    });
  }
};

// Récupérer un post par son ID
exports.getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

// Récupérer les posts d'un utilisateur
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await postService.getPostsByUserId(userId);
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
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
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Changer le statut d'un post
exports.updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!Object.values(POST_STATUS).includes(status)) {
      throw new Error("Invalid status");
    }

    const post = await postService.updatePostStatus(
      req.params.id,
      req.user._id,
      status
    );
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getPostsByUserTopSkills = async (req, res) => {
  try {
    const userId = req.user._id; // Adapté selon comment tu passes l'id (paramètre, JWT…)
    const posts = await postService.getPostsByUserTopSkill(userId);
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Send technical test task
exports.sendTechnicalTest = async (req, res) => {
  try {
    const { postId, candidateEmail, candidateName } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!postId || !candidateEmail || !candidateName) {
      return res.status(400).json({
        success: false,
        error: "postId, candidateEmail, and candidateName are required",
      });
    }

    const result = await postService.createAndSendTechnicalTest(
      postId,
      token,
      candidateEmail,
      candidateName
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get public statistics (users, posts, companies)
exports.getPublicStats = async (req, res) => {
  try {
    const User = require("../../models/UserModel");
    const Post = require("../../models/PostModel");

    // Count total users
    const userCount = await User.countDocuments();

    // Count total posts
    const postCount = await Post.countDocuments();

    // Count companies from User table (where role is 'Company')
    const companyCount = await User.countDocuments({ role: "Company" });

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        posts: postCount,
        companies: companyCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
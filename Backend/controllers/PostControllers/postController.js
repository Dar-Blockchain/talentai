const { POST_STATUS } = require("../../constants/postConstants");
const postService = require("../../services/PosteServices/postService");
const { sendPostEmail } = require("../../utils/mailing");
const matchingConfigService = require("../../services/MatchingService/matchingConfigService");
const { parseJsonFields, validateTechnicalTestInput } = require("../../helpers/postValidationHelpers");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error('Post error:', error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({ success: false, error: error?.message || 'Internal error' });
};

// Créer un nouveau post
exports.createPost = async (req, res) => {
  try {
    // Parse JSON fields safely from form-data
    const parsedData = parseJsonFields(req.body);

    const postData = {
      ...parsedData,
      user: req.user._id,
    };

    // Get token from Authorization header
    const token = req.headers.authorization?.replace("Bearer ", "");

    const post = await postService.createPost(postData, token);

    // Create matching config if provided (non-blocking)
    let createdMatchingConfig = null;
    if (parsedData.matchingConfig) {
      matchingConfigService.addConfig(req.user._id, {
        ...parsedData.matchingConfig,
        jobId: post._id
      }).then(cfg => {
        createdMatchingConfig = cfg;
      }).catch(cfgErr => {
        console.error('Error creating matching config:', cfgErr.message);
      });
    }

    res.status(201).json({
      success: true,
      data: post,
      matchingConfig: createdMatchingConfig,
    });
  } catch (error) {
    handleError(res, error, 400);
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
    handleError(res, error, 400);
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
      status,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100

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
      filters,
    });
  } catch (error) {
    console.error("Error in getAllPostsWithSearch:", error?.message);
    handleError(res, error, 500);
  }
};

// Récupérer les détails d'un post par son ID (public)
exports.getPostDetailsPublic = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    const post = await postService.getPostById(req.params.id);
    console.log('📄 Public job details requested for ID:', req.params.id);

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('❌ Error fetching public job details:', error?.message);
    handleError(res, error, 404);
  }
};

// Récupérer un post par son ID
exports.getPostById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    const post = await postService.getPostById(req.params.id);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    handleError(res, error, 404);
  }
};

// Récupérer les posts d'un utilisateur
exports.getUserPosts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const posts = await postService.getPostsByUserId(req.user._id);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Mettre à jour un post
exports.updatePost = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    const post = await postService.updatePost(
      req.params.id,
      req.user._id,
      req.body
    );
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Supprimer un post
exports.deletePost = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    await postService.deletePost(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Changer le statut d'un post
exports.updatePostStatus = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    const { status } = req.body;
    if (!status || !Object.values(POST_STATUS).includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const post = await postService.updatePostStatus(
      req.params.id,
      req.user._id,
      status
    );
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    handleError(res, error, 400);
  }
};

exports.getPostsByUserTopSkills = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const posts = await postService.getPostsByUserTopSkill(req.user._id);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Send technical test task
exports.sendTechnicalTest = async (req, res) => {
  try {
    const { postId, candidateEmail, candidateName } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    // Validate input
    validateTechnicalTestInput(postId, candidateEmail, candidateName);

    const result = await postService.createAndSendTechnicalTest(
      postId,
      token,
      candidateEmail,
      candidateName
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Get public statistics (users, posts, companies)
exports.getPublicStats = async (req, res) => {
  try {
    const User = require("../../models/UserModel");
    const Post = require("../../models/PostModel");

    // Count in parallel with .lean() for read-only
    const [userCount, postCount, companyCount] = await Promise.all([
      User.countDocuments().lean(),
      Post.countDocuments().lean(),
      User.countDocuments({ role: "Company" }).lean()
    ]);

    res.status(200).json({
      success: true,
      data: { users: userCount, posts: postCount, companies: companyCount }
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};
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

    // For pipeline jobs, extract skills from Post_Steps instead of skillAnalysis
    if (post.creationType === 'pipeline' && post.post_Steps && post.post_Steps.length > 0) {
      console.log('🔄 Pipeline job detected - extracting skills from steps');

      const pipelineSkills = [];
      const pipelineSoftSkills = [];

      // Extract skills from each technical/soft step
      post.post_Steps.forEach(step => {
        console.log(`📋 Checking step: type=${step.data?.type}, configured=${step.data?.config?.configured}`);

        if (step.data?.type === 'technical' && step.data?.config?.skills) {
          console.log(`  → Found ${step.data.config.skills.length} technical skills`);
          // Add technical skills with their required level
          step.data.config.skills.forEach(skill => {
            pipelineSkills.push({
              name: skill.name,
              level: skill.requiredLevel || 'Intermediate'
            });
          });
        }

        if (step.data?.type === 'soft' && step.data?.config?.softSkills) {
          console.log(`  → Found ${step.data.config.softSkills.length} soft skills`);
          // Add soft skills
          step.data.config.softSkills.forEach(softSkill => {
            pipelineSoftSkills.push(softSkill);
          });
        }
      });

      // 🔥 ALWAYS override skillAnalysis for pipeline jobs to avoid showing default skills
      post.skillAnalysis = post.skillAnalysis || {};

      if (pipelineSkills.length > 0 || pipelineSoftSkills.length > 0) {
        // Use extracted pipeline skills
        post.skillAnalysis.requiredSkills = [
          ...pipelineSkills,
          ...pipelineSoftSkills.map(skill => ({ name: skill, level: 'Intermediate' }))
        ];
        console.log(`✅ Extracted ${pipelineSkills.length} technical + ${pipelineSoftSkills.length} soft skills from pipeline`);
      } else {
        // Clear default skills to avoid showing wrong data
        post.skillAnalysis.requiredSkills = [];
        console.log('⚠️ No skills found in pipeline steps - clearing default skills');
      }
    }

    res.status(200).json({
      success: true,
      data: post,
    });
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

// Get pipeline job details with all step configurations
exports.getPipelineJobDetails = async (req, res) => {
  try {
    const jobDetails = await postService.getPipelineJobDetails(req.params.id);
    res.status(200).json({
      success: true,
      ...jobDetails
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
    const userId = req.user._id; // Adapté selon comment tu passes l'id (paramètre, JWT…)
    const posts = await postService.getPostsByUserTopSkill(userId);

    // DEBUG: Log response structure before sending
    console.log('🔍 DEBUG - Controller sending response:', {
      success: posts.success,
      postsCount: posts.posts?.length || 0,
      firstPost: posts.posts?.[0] ? {
        _id: posts.posts[0]._id,
        creationType: posts.posts[0].creationType,
        hasPostSteps: !!posts.posts[0].post_Steps,
        postStepsLength: posts.posts[0].post_Steps?.length
      } : null
    });

    res.status(200).json({
      success: true,
      data: posts,
    });
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

// Get interview configuration for job-based HR interview (prompt flow)
exports.getJobInterviewConfig = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user?._id || req.query.candidateId;
    const Post = require("../../models/PostModel");

    // Fetch job post with user (company) info and post_Steps
    const post = await Post.findById(jobId)
      .populate('user')
      .populate('post_Steps');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Job post not found'
      });
    }

    // ⚠️ IMPORTANT: This endpoint is ONLY for non-pipeline jobs
    // Pipeline jobs should use /api/pipeline-interview/progress API instead
    const isPipeline = post.creationType === 'pipeline';

    if (isPipeline) {
      console.log('❌ Pipeline job detected - rejecting request to use pipeline interview flow');
      return res.status(400).json({
        success: false,
        error: 'This endpoint cannot be used for pipeline jobs',
        message: 'Pipeline jobs must use the pipeline interview flow via /api/pipeline-interview/progress API',
        hint: 'This job has a recruitment pipeline with configured steps. Use the pipeline progress API to get step-specific interview configuration.',
        isPipeline: true,
        jobId: jobId,
        stepsCount: post.post_Steps?.length || 0
      });
    }

    // Extract company and job details (for NON-pipeline jobs only)
    const companyName = post.user?.companyDetails?.name || 'Company';
    const jobTitle = post.jobDetails?.title || 'Position';
    const experienceLevel = post.jobDetails?.experienceLevel || 'Mid Level';

    let technicalSkills = [];
    let softSkills = [];

    // Extract skills from skillAnalysis (for non-pipeline jobs)
    const allSkills = post.skillAnalysis?.requiredSkills || [];
    const softSkillsFromPost = post.skillAnalysis?.softSkills || [];

    // Separate technical skills from soft skills
    technicalSkills = allSkills.filter(skill => {
      const skillName = (typeof skill === 'string' ? skill : skill.name).toLowerCase();
      // Filter out soft skills
      const softSkillKeywords = ['communication', 'teamwork', 'leadership', 'problem solving', 'adaptability', 'time management', 'collaboration'];
      return !softSkillKeywords.some(keyword => skillName.includes(keyword));
    }).map(skill => typeof skill === 'string' ? skill : skill.name);

    // Format soft skills
    softSkills = (softSkillsFromPost || []).map(skill =>
      typeof skill === 'string' ? skill : skill.name
    );

    console.log('📊 Non-Pipeline Interview Skills Analysis:', {
      companyName,
      jobTitle,
      experienceLevel,
      technicalSkills,
      softSkills,
      totalSkills: technicalSkills.length + softSkills.length
    });

    // Build TECHNICAL interview configuration (for non-pipeline jobs)
    const config = {
      interviewType: 'TECHNICAL_SKILL',
      testReason: `Technical Skills Assessment for ${jobTitle} at ${companyName}`,
      context: {
        targetCompany: companyName,
        targetRole: jobTitle,
        experienceLevel: experienceLevel,

        // Technical interview goal
        interviewGoal: `Deep technical assessment for ${jobTitle} position - evaluate hands-on skills, problem-solving, and technical depth`,

        // SEPARATED SKILLS
        requiredSkills: technicalSkills,
        softSkills: softSkills,

        // Technical focus
        technicalFocus: true,
        assessmentDepth: 'deep',
        questionTypes: [
          'coding-proficiency',
          'system-architecture',
          'problem-solving',
          'technical-implementation',
          'best-practices',
          'real-world-scenarios'
        ],

        // Job details
        jobDescription: post.jobDetails?.description || '',
        responsibilities: post.jobDetails?.responsibilities || '',
        requirements: post.jobDetails?.requirements || '',

        // Interview strategy
        interviewStrategy: {
          startWithBasics: false,
          probeDepth: 'deep',
          followUpOnVagueAnswers: true,
          requireSpecificExamples: true,
          assessPracticalExperience: true
        }
      },
      models: {
        fastModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        thinkingModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        analysisModel: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
      },
      sessionSettings: {
        duration: 45,
        language: 'en',
        difficulty: 'intermediate',
        silenceTimeout: 10,
        silenceIntelligence: {
          enabled: true,
          adaptiveThresholds: true,
          maxSilencePrompts: 3,
          naturalPauseDetection: true,
          contextAwareThresholds: true
        }
      }
    };

    res.json(config);

  } catch (error) {
    console.error('Error in getJobInterviewConfig:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
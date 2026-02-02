const { POST_STATUS } = require("../../constants/posts.constants");
const postService = require("../../services/PosteServices/post.service");
const { sendPostEmail } = require("../../utils/mailing");
const matchingConfigService = require("../../services/MatchingService/matchingConfig.service");
const { parseJsonFields, validateTechnicalTestInput } = require("../../helpers/post.validation.helpers");
const notificationService = require("../../services/notificationSystem.service");
const User = require("../../models/User.model");
const Profile = require("../../models/Profile.model");

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

    // Map workMode from companyDetails.employmentType if not already set
    if (parsedData.jobDetails && !parsedData.jobDetails.workMode) {
      if (parsedData.companyDetails?.employmentType) {
        parsedData.jobDetails.workMode = parsedData.companyDetails.employmentType;
      } else if (parsedData.employmentType) {
        parsedData.jobDetails.workMode = parsedData.employmentType;
      }
    }

    const postData = {
      ...parsedData,
      user: req.user._id, //id => token ("membre" req.user.campagny)
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

    // Notify candidates who have at least one matching hard skill with the post (best-effort)
    (async () => {
      try {
        console.log('🔔 Starting notification process...');
        
        // Extract skill names from the post (supports strings or objects)
        const skillSources = [];
        if (post.skillAnalysis && Array.isArray(post.skillAnalysis.requiredSkills)) {
          skillSources.push(...post.skillAnalysis.requiredSkills);
        }
        if (post.jobDetails && Array.isArray(post.jobDetails.requiredSkills)) {
          skillSources.push(...post.jobDetails.requiredSkills);
        }
        if (Array.isArray(parsedData.requiredSkills)) {
          skillSources.push(...parsedData.requiredSkills);
        }

        console.log('📋 skillSources extracted:', skillSources);

        // Normalize to lowercase names
        const skillNames = [...new Set(skillSources.map(s => (typeof s === 'string' ? s : (s && s.name) || '').toString().trim().toLowerCase()).filter(Boolean))];

        console.log('🏷️ Normalized skillNames:', skillNames);

        if (skillNames.length === 0) {
          console.log('⚠️ No hard skills found on post — skipping targeted notifications');
          return;
        }

        // Find profiles of type Candidate having at least one matching skill ($in = OR logic)
        console.log('🔍 Searching for Candidate profiles with AT LEAST ONE skill matching:', skillNames);
        
        // First, let's check what skills exist in the DB for debugging
        const allCandidateProfiles = await Profile.find({
          type: 'Candidate',
          'skills': { $exists: true, $ne: [] }
        }).select('userId skills').lean();
        
        console.log('📊 Total Candidate profiles with skills:', allCandidateProfiles.length);
        if (allCandidateProfiles.length > 0) {
          const sampleProfile = allCandidateProfiles[0];
          const sampleSkills = sampleProfile.skills ? sampleProfile.skills.map(s => s.name) : [];
          console.log('📋 Sample candidate skills from DB:', sampleSkills);
          console.log('🔤 Skill names to match (normalized):', skillNames);
          
          // Check for case sensitivity issues
          const lowerSampleSkills = sampleSkills.map(s => String(s).toLowerCase());
          console.log('📋 Sample skills (lowercase):', lowerSampleSkills);
        }
        
        const matchingProfiles = await Profile.find({
          type: 'Candidate',
          'skills.name': { $in: skillNames }
        }).select('userId skills').lean();
        
        console.log('✅ matchingProfiles found (exact match):', matchingProfiles.length);
        
        // If no exact match, try case-insensitive search
        if (matchingProfiles.length === 0 && skillNames.length > 0) {
          console.log('⚠️ No exact matches found, trying case-insensitive search...');
          const caseInsensitiveProfiles = await Profile.find({
            type: 'Candidate'
          }).lean();
          
          const matchedProfiles = caseInsensitiveProfiles.filter(profile => {
            if (!profile.skills || profile.skills.length === 0) return false;
            const profileSkillNames = profile.skills.map(s => String(s.name).toLowerCase());
            return skillNames.some(skillName => profileSkillNames.includes(skillName));
          });
          
          console.log('✅ matchingProfiles found (case-insensitive):', matchedProfiles.length);
          matchingProfiles.push(...matchedProfiles);
        }
        
        console.log('📋 Full matchingProfiles:', matchingProfiles.map(p => ({ userId: p.userId, skills: p.skills?.map(s => s.name) })));
        
        const recipientIds = matchingProfiles.map(p => String(p.userId)).filter(Boolean);
        console.log('👥 recipientIds extracted:', recipientIds);
        console.log('📊 recipientIds count:', recipientIds.length);
        
        if (recipientIds.length === 0) {
          console.log('⚠️ No matching candidate profiles found for skills:', skillNames);
          return;
        }

        const title = (post.jobDetails && post.jobDetails.title) || post.title || 'Nouvelle offre';
        const content = `Nouvelle offre: ${title} — correspond à vos compétences techniques.`;

        console.log('📤 Calling broadcastSystemNotification with:', { content, recipientIdsCount: recipientIds.length, recipientIds });
        
        await notificationService.broadcastSystemNotification(content, recipientIds);
        
        console.log(`✅ Sent notifications to ${recipientIds.length} matching candidates for skills:`, skillNames);
      } catch (notifErr) {
        console.error('❌ Failed to send targeted post notifications to candidates:', notifErr?.message || notifErr);
        console.error('Stack trace:', notifErr?.stack);
      }
    })();

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

    // For pipeline jobs, extract skills from PostSteps instead of skillAnalysis
    // For pipeline jobs, extract skills from Post_Steps instead of skillAnalysis
    if (post.creationType === 'pipeline' && post.PostSteps && post.PostSteps.length > 0) {
      console.log('🔄 Pipeline job detected - extracting skills from steps');

      const pipelineSkills = [];
      const pipelineSoftSkills = [];

      // Extract skills from each technical/soft step
      post.PostSteps.forEach(step => {
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

    const {
      page = 1,
      limit = 6,
      search = '',
      sort = 'newest',
    } = req.query;

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100

    // Validate sort option
    const validSorts = ['newest', 'oldest', 'title_asc', 'title_desc'];
    const sortOption = validSorts.includes(sort) ? sort : 'newest';

    const result = await postService.getPostsByUserIdWithPagination(
      req.user._id,
      pageNum,
      limitNum,
      search,
      sortOption
    );

    res.status(200).json({
      success: true,
      results: result.posts,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages,
      hasNextPage: result.pagination.hasNextPage,
      hasPrevPage: result.pagination.hasPrevPage,
    });
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
    const userId = req.user._id;
    
    // 📥 [getPostsByUserTopSkills] Extract pagination params from query
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    
    console.log(`📥 [getPostsByUserTopSkills] Extract pagination - page: ${page}, limit: ${limit}`);

    const result = await postService.getPostsByUserTopSkill(userId, page, limit);

    // DEBUG: Log response structure before sending
    console.log('🔍 [getPostsByUserTopSkills] Controller response:', {
      success: result.success,
      dataCount: result.data?.length || 0,
      pagination: result.pagination,
      firstPost: result.data?.[0] ? {
        _id: result.data[0]._id,
        creationType: result.data[0].creationType,
        hasPostSteps: !!result.data[0].PostSteps,
        postStepsLength: result.data[0].PostSteps?.length
      } : null
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: result.message
    });
  } catch (error) {
    console.error('❌ [getPostsByUserTopSkills] Error:', error.message);
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
    const User = require("../../models/User.model");
    const Post = require("../../models/Post.model");

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
    const Post = require("../../models/Post.model");

    // Fetch job post with user (company) info and PostSteps
    const post = await Post.findById(jobId)
      .populate('user')
      .populate('PostSteps');

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
        stepsCount: post.PostSteps?.length || 0
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
const { POST_STATUS } = require("../../constants/posts.constants");
const postService = require("../../services/PosteServices/post.service");
const subscriptionService = require("../../services/subscription.service");
const {
  parseJsonFields,
} = require("../../helpers/post.validation.helpers");
const Profile = require("../../models/Profile.model");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("Post error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res
    .status(status)
    .json({ success: false, error: error?.message || "Internal error" });
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    // ========== 1. VALIDATE & PREPARE INPUT ==========
    const parsedData = parseJsonFields(req.body);
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = req.user._id;

    // ========== 2. AUTHORIZATION & PROFILE CHECK ==========
    const userProfile = await Profile.findOne({ userId }).populate(
      "activeSubscription"
    );
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: "User profile not found",
      });
    }

    // ========== 3. RESOURCE LIMIT CHECK ==========
    if (userProfile.type === "Company") {
      if (!userProfile.activeSubscription) {
        return res.status(403).json({
          success: false,
          error: "No active subscription found",
          message: "Please purchase a plan to create posts",
        });
      }

      try {
        const limitCheck = await subscriptionService.checkSubscriptionLimit(
          userProfile._id,
          "posts"
        );

        if (!limitCheck.canUse) {
          return res.status(403).json({
            success: false,
            error: "Posts limit reached",
            message: limitCheck.message,
            planName: limitCheck.limitData?.planName,
            postsLimit: limitCheck.limitData?.limit,
            postsUsed: limitCheck.limitData?.used,
          });
        }
      } catch (limitError) {
        console.error("Error checking subscription limit:", limitError);
        return res.status(400).json({
          success: false,
          error: "Error checking plan limits",
          message: limitError.message,
        });
      }
    }

    // ========== 4. CREATE POST ==========
    const postData = {
      ...parsedData,
      user: userId,
      createdBy: req.actualUser?._id || req.user._id,
    };

    // Handle custom expiration date (optional)
    if (parsedData.expirationDate) {
      const expirationDate = new Date(parsedData.expirationDate);
      const now = new Date();

      // Validate expiration date is in the future
      if (expirationDate <= now) {
        return res.status(400).json({
          success: false,
          error: "Invalid expiration date",
          message: "Expiration date must be in the future",
        });
      }

      postData.expirationDate = expirationDate;
    }

    const result = await postService.createPostWithSideEffects(
      postData,
      token,
      userProfile,
      parsedData.matchingConfig,
    );

    // ========== 5. RETURN RESPONSE ==========
    res.status(201).json({
      success: true,
      data: result.post,
      matchingConfig: result.matchingConfig,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Retrieve all posts
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

// Retrieve all posts with search, filters and pagination
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

    const result = await postService.getAllPostsWithSearch(
      filters,
      pageNum,
      limitNum,
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
      filters,
    });
  } catch (error) {
    console.error("Error in getAllPostsWithSearch:", error?.message);
    handleError(res, error, 500);
  }
};

// Retrieve post details by ID (public)
exports.getPostDetailsPublic = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }

    const post = await postService.getPostById(req.params.id);

    console.log("📄 Public job details requested for ID:", req.params.id);

    // For pipeline jobs, extract skills from PostSteps instead of skillAnalysis
    // For pipeline jobs, extract skills from Post_Steps instead of skillAnalysis
    if (
      post.creationType === "pipeline" &&
      post.PostSteps &&
      post.PostSteps.length > 0
    ) {
      console.log("🔄 Pipeline job detected - extracting skills from steps");

      const pipelineSkills = [];
      const pipelineSoftSkills = [];

      // Extract skills from each technical/soft step
      post.PostSteps.forEach((step) => {
        console.log(
          `📋 Checking step: type=${step.data?.type}, configured=${step.data?.config?.configured}`,
        );

        if (step.data?.type === "technical" && step.data?.config?.skills) {
          console.log(
            `  → Found ${step.data.config.skills.length} technical skills`,
          );
          // Add technical skills with their required level
          step.data.config.skills.forEach((skill) => {
            pipelineSkills.push({
              name: skill.name,
              level: skill.requiredLevel || "Intermediate",
            });
          });
        }

        if (step.data?.type === "soft" && step.data?.config?.softSkills) {
          console.log(
            `  → Found ${step.data.config.softSkills.length} soft skills`,
          );
          // Add soft skills
          step.data.config.softSkills.forEach((softSkill) => {
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
          ...pipelineSoftSkills.map((skill) => ({
            name: skill,
            level: "Intermediate",
          })),
        ];
        console.log(
          `✅ Extracted ${pipelineSkills.length} technical + ${pipelineSoftSkills.length} soft skills from pipeline`,
        );
      } else {
        // Clear default skills to avoid showing wrong data
        post.skillAnalysis.requiredSkills = [];
        console.log(
          "⚠️ No skills found in pipeline steps - clearing default skills",
        );
      }
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("❌ Error fetching public job details:", error?.message);
    handleError(res, error, 404);
  }
};

// Retrieve post by ID
exports.getPostById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
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
      ...jobDetails,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

// Retrieve user posts
exports.getUserPosts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    const { page = 1, limit = 6, search = "", sort = "newest", status = "", archived = "false", creationType = "" } = req.query;
    // Parse archived parameter: "true" string becomes boolean true, else false
    const showArchived = archived === "true";

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100

    // Validate sort option
    const validSorts = ["newest", "oldest", "title_asc", "title_desc"];
    const sortOption = validSorts.includes(sort) ? sort : "newest";

    const result = await postService.getPostsByUserIdWithPagination(
      req.user._id,
      pageNum,
      limitNum,
      search,
      sortOption,
      status,
      showArchived,
      creationType,
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

// Update a post
exports.updatePost = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }

    const updatedBy = req.actualUser?._id || req.user._id;
    const post = await postService.updatePost(
      req.params.id,
      req.user._id,
      { ...req.body, updatedBy },
    );
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }

    await postService.deletePost(req.params.id, req.user._id);
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Changer le statut d'un post
exports.updatePostStatus = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }

    const { status } = req.body;
    if (!status || !Object.values(POST_STATUS).includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const updatedBy = req.actualUser?._id || req.user._id;
    const post = await postService.updatePostStatus(
      req.params.id,
      req.user._id,
      status,
      updatedBy,
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

    console.log(
      `📥 [getPostsByUserTopSkills] Extract pagination - page: ${page}, limit: ${limit}`,
    );

    const result = await postService.getPostsByUserTopSkill(
      userId,
      page,
      limit,
    );

    // DEBUG: Log response structure before sending
    console.log("🔍 [getPostsByUserTopSkills] Controller response:", {
      success: result.success,
      dataCount: result.data?.length || 0,
      pagination: result.pagination,
      firstPost: result.data?.[0]
        ? {
            _id: result.data[0]._id,
            creationType: result.data[0].creationType,
            hasPostSteps: !!result.data[0].PostSteps,
            postStepsLength: result.data[0].PostSteps?.length,
          }
        : null,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ [getPostsByUserTopSkills] Error:", error.message);
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
      User.countDocuments({ role: "Company" }).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { users: userCount, posts: postCount, companies: companyCount },
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
      .populate("user")
      .populate("PostSteps");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Job post not found",
      });
    }

    // ⚠️ IMPORTANT: This endpoint is ONLY for non-pipeline jobs
    // Pipeline jobs should use /api/pipeline-interview/progress API instead
    const isPipeline = post.creationType === "pipeline";

    if (isPipeline) {
      console.log(
        "❌ Pipeline job detected - rejecting request to use pipeline interview flow",
      );
      return res.status(400).json({
        success: false,
        error: "This endpoint cannot be used for pipeline jobs",
        message:
          "Pipeline jobs must use the pipeline interview flow via /api/pipeline-interview/progress API",
        hint: "This job has a recruitment pipeline with configured steps. Use the pipeline progress API to get step-specific interview configuration.",
        isPipeline: true,
        jobId: jobId,
        stepsCount: post.PostSteps?.length || 0,
      });
    }

    // Check if post has expired
    if (post.expirationDate && new Date(post.expirationDate) < new Date()) {
      console.log("❌ Job post has expired");
      return res.status(410).json({
        success: false,
        error: "Job post has expired",
        message:
          "This job post has exceeded its expiration date and is no longer accepting applications",
        expirationDate: post.expirationDate,
        jobTitle: post.jobDetails?.title || "",
      });
    }

    // Check if company has reached monthly interview limit
    const companyProfile = await Profile.findOne({
      userId: post.user._id,
    }).populate("activeSubscription");

    if (companyProfile && companyProfile.activeSubscription) {
      try {
        const limitCheck = await subscriptionService.checkSubscriptionLimit(
          companyProfile._id,
          "monthlyInterviews"
        );

        if (!limitCheck.canUse) {
          console.log("❌ Company has reached maximum monthly interviews limit");

          // Notify the company (best-effort — don't fail the response if it errors)
          try {
            const notificationService = require("../../services/notificationSystem.service");
            const jobTitle = post.jobDetails?.title || "a job post";
            const planName = limitCheck.limitData?.planName || "your plan";
            const used = limitCheck.limitData?.used ?? 0;
            const limit = limitCheck.limitData?.limit ?? 0;
            await notificationService.createNotification(
              post.user._id,
              `⚠️ Interview limit reached: A candidate tried to start an interview for "${jobTitle}" but your monthly interview limit (${used}/${limit}) has been reached. Upgrade your plan to continue receiving interviews.`,
              "warning"
            );
          } catch (notifErr) {
            console.warn("Failed to send limit notification to company:", notifErr.message);
          }

          return res.status(429).json({
            success: false,
            error: "Monthly interview limit reached",
            message: limitCheck.message,
            monthlyInterviewLimit: limitCheck.limitData?.limit,
            monthlyInterviewsUsed: limitCheck.limitData?.used,
            planName: limitCheck.limitData?.planName,
            jobTitle: post.jobDetails?.title || "",
          });
        }
      } catch (limitError) {
        console.error("Error checking interview limit:", limitError);
        return res.status(400).json({
          success: false,
          error: "Error checking interview limits",
          message: limitError.message,
        });
      }
    }

    // Extract company and job details (for NON-pipeline jobs only)
    const companyName = companyProfile?.companyDetails?.name || "Company";
    const jobTitle = post.jobDetails?.title || "Position";
    const experienceLevel = post.jobDetails?.experienceLevel || "Mid Level";

    let technicalSkills = [];
    let softSkills = [];

    // Extract skills from skillAnalysis (for non-pipeline jobs)
    const allSkills = post.skillAnalysis?.requiredSkills || [];
    const softSkillsFromPost = post.skillAnalysis?.softSkills || [];

    // Separate technical skills from soft skills
    technicalSkills = allSkills
      .filter((skill) => {
        const skillName = (
          typeof skill === "string" ? skill : skill.name
        ).toLowerCase();
        // Filter out soft skills
        const softSkillKeywords = [
          "communication",
          "teamwork",
          "leadership",
          "problem solving",
          "adaptability",
          "time management",
          "collaboration",
        ];
        return !softSkillKeywords.some((keyword) =>
          skillName.includes(keyword),
        );
      })
      .map((skill) => (typeof skill === "string" ? skill : skill.name));

    // Format soft skills
    softSkills = (softSkillsFromPost || []).map((skill) =>
      typeof skill === "string" ? skill : skill.name,
    );

    console.log("📊 Non-Pipeline Interview Skills Analysis:", {
      companyName,
      jobTitle,
      experienceLevel,
      technicalSkills,
      softSkills,
      totalSkills: technicalSkills.length + softSkills.length,
    });

    // Build TECHNICAL interview configuration (for non-pipeline jobs)
    const config = {
      interviewType: "TECHNICAL_SKILL",
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
        assessmentDepth: "deep",
        questionTypes: [
          "coding-proficiency",
          "system-architecture",
          "problem-solving",
          "technical-implementation",
          "best-practices",
          "real-world-scenarios",
        ],

        // Job details
        jobDescription: post.jobDetails?.description || "",
        responsibilities: post.jobDetails?.responsibilities || "",
        requirements: post.jobDetails?.requirements || "",

        // Interview strategy
        interviewStrategy: {
          startWithBasics: false,
          probeDepth: "deep",
          followUpOnVagueAnswers: true,
          requireSpecificExamples: true,
          assessPracticalExperience: true,
        },
      },
      models: {
        fastModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        thinkingModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        analysisModel: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      },
      sessionSettings: {
        duration: 45,
        language: "en",
        difficulty: "intermediate",
        silenceTimeout: 10,
        silenceIntelligence: {
          enabled: true,
          adaptiveThresholds: true,
          maxSilencePrompts: 3,
          naturalPauseDetection: true,
          contextAwareThresholds: true,
        },
      },
    };

    res.json(config);
  } catch (error) {
    console.error("Error in getJobInterviewConfig:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Get post metrics (count by status)
 */
exports.getPostMetrics = async (req, res) => {
  try {
    const userId = req.user._id;

    const metrics = await postService.getPostMetrics(userId);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

const fs = require("fs");
const path = require("path");
const { POST_STATUS } = require("./posts.constants");
const postService = require("./post.service");
const subscriptionService = require("../billing/subscriptions/subscription.service");
const {
  parseJsonFields,
  flattenPost,
} = require("./post.validation.helpers");
const Profile = require("../users/profile.model");
const Subscription = require("../billing/subscriptions/subscription.model");
const PlanLimits = require("../billing/plans/plan-limits.model");
const { notifyMatchingCandidates } = require("./job-match.service");
const JobApplication = require("../job-applications/job-application.model");

const handleError = (res, error, defaultStatus = 500) => {
  console.error("Post error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res
    .status(status)
    .json({ success: false, error: error?.message || "Internal error" });
};

exports.createPost = async (req, res) => {
  try {
    const parsedData = parseJsonFields(req.body);
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userId = req.user._id;

    let expirationDate;
    if (parsedData.expirationDate) {
      expirationDate = new Date(parsedData.expirationDate);
      if (expirationDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Invalid expiration date",
          message: "Expiration date must be in the future",
        });
      }
    }

    if (parsedData.thresholdScore !== undefined) {
      const score = Number(parsedData.thresholdScore);
      if (isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          error: "Invalid thresholdScore",
          message: "thresholdScore must be a number between 0 and 100",
        });
      }
      parsedData.thresholdScore = score;
    }

    const userProfile = await Profile.findOne({ userId })
      .populate("activeSubscription")
      .lean();
    if (!userProfile) {
      return res.status(404).json({ success: false, error: "User profile not found" });
    }

    if (userProfile.type === "Company") {
      try {
        const existingSubCount = await Subscription.countDocuments({
          companyProfileId: userProfile._id,
          status: "active",
          endDate: { $gt: new Date() },
        });

        if (existingSubCount === 0) {
          const freePlan = await PlanLimits.findOne({ name: "Trial", isActive: true });
          if (freePlan) {
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 100);
            const freeSub = await Subscription.create({
              companyProfileId: userProfile._id,
              planId: freePlan._id,
              startDate: new Date(),
              endDate,
              status: "active",
              autoRenew: false,
            });
            await Profile.findByIdAndUpdate(userProfile._id, {
              activeSubscription: freeSub._id,
              $addToSet: { subscriptions: freeSub._id },
            });
          }
        }

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

    const postData = {
      ...parsedData,
      user: userId,
      createdBy: req.actualUser?._id || req.user._id,
      ...(expirationDate && { expirationDate }),
    };

    const post = await postService.createPostWithSideEffects(
      postData,
      token,
      userProfile,
    );

    if (post?.status === POST_STATUS.OPEN) {
      notifyMatchingCandidates(String(post._id)).catch(err =>
        console.error("Job match email error:", err.message)
      );
    }

    res.status(201).json({ success: true, data: flattenPost(post) });
  } catch (error) {
    handleError(res, error, 400);
  }
};

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

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

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

exports.getPostDetailsPublic = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }

    const post = await postService.getPostById(req.params.id);

    const applicationCount = await JobApplication.countDocuments({ post: req.params.id });

    res.status(200).json({
      success: true,
      data: { ...post, applicationCount },
    });
  } catch (error) {
    console.error("❌ Error fetching public job details:", error?.message);
    handleError(res, error, 404);
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    const { page = 1, limit = 6, search = "", sort = "newest", status = "", archived = "false", creationType = "" } = req.query;
    const showArchived = archived === "true";

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

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

exports.updatePost = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }

    const updateData = { ...req.body };
    const updatedBy = req.actualUser?._id || req.user._id;

    if (updateData.thresholdScore !== undefined) {
      const score = Number(updateData.thresholdScore);
      if (isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          error: "Invalid thresholdScore",
          message: "thresholdScore must be a number between 0 and 100",
        });
      }
      updateData.thresholdScore = score;
    }

    if (updateData.thresholdScoreInterview !== undefined) {
      const score = Number(updateData.thresholdScoreInterview);
      if (isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          error: "Invalid thresholdScoreInterview",
          message: "thresholdScoreInterview must be a number between 0 and 100",
        });
      }
      updateData.thresholdScoreInterview = score;
    }

    const post = await postService.updatePost(
      req.params.id,
      req.user._id,
      { ...updateData, updatedBy },
    );
    res.status(200).json({ success: true, data: flattenPost(post) });
  } catch (error) {
    handleError(res, error, 400);
  }
};

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

    if (status === POST_STATUS.OPEN) {
      notifyMatchingCandidates(req.params.id).catch(err =>
        console.error("Job match email error:", err.message)
      );
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    handleError(res, error, 400);
  }
};

exports.getPostsByUserTopSkills = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;


    const result = await postService.getPostsByUserTopSkill(
      userId,
      page,
      limit,
    );


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

exports.getPublicStats = async (req, res) => {
  try {
    const User = require("../users/user.model");
    const Post = require("./post.model");

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

exports.getJobInterviewConfig = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user?._id || req.query.candidateId;
    const Post = require("./post.model");

    const post = await Post.findById(jobId)
      .populate("user");

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Job post not found",
      });
    }

    if (post.expirationDate && new Date(post.expirationDate) < new Date()) {
      return res.status(404).json({
        success: false,
        error: "Job post has expired",
        message:
          "This job post has exceeded its expiration date and is no longer accepting applications",
        expirationDate: post.expirationDate,
        jobTitle: post.jobDetails?.title || "",
      });
    }

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

          try {
            const notificationService = require("../notifications/notification.service");
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

    const companyName = companyProfile?.companyDetails?.name || "Company";
    const jobTitle = post.jobDetails?.title || "Position";
    const experienceLevel = post.jobDetails?.experienceLevel || "Mid Level";

    let technicalSkills = [];
    let softSkills = [];

    const allSkills = post.skillAnalysis?.requiredSkills || [];
    const softSkillsFromPost = post.skillAnalysis?.softSkills || [];

    technicalSkills = allSkills
      .filter((skill) => {
        const skillName = (
          typeof skill === "string" ? skill : skill.name
        ).toLowerCase();
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

    softSkills = (softSkillsFromPost || []).map((skill) =>
      typeof skill === "string" ? skill : skill.name,
    );


    const config = {
      interviewType: "HR_INTERVIEW",
      testReason: `Job Interview for ${jobTitle} at ${companyName}`,
      context: {
        targetCompany: companyName,
        targetRole: jobTitle,
        experienceLevel: experienceLevel,

        interviewGoal: `Comprehensive interview for ${jobTitle} position - evaluate experience, skills, problem-solving, and cultural fit`,

        requiredSkills: technicalSkills,
        softSkills: softSkills,

        assessmentDepth: "moderate",
        questionTypes: [
          "behavioral",
          "situational",
          "technical",
          "problem-solving",
          "experience-based",
        ],

        jobDescription: post.jobDetails?.description || "",
        responsibilities: post.jobDetails?.responsibilities || "",
        requirements: post.jobDetails?.requirements || "",

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
        language: post.interviewLanguages?.[0] || "en",
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

exports.getPostsInAlertKPI = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await postService.getPostsInAlertKPI(userId);

    res.status(200).json({
      success: true,
      message: "Posts in alert KPI retrieved successfully",
      data,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

exports.getPostsByDepartmentKPI = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await postService.getPostsByDepartmentKPI(userId);

    res.status(200).json({
      success: true,
      message: "Posts by department KPI retrieved successfully",
      data,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

exports.getPostsStatusKPI = async (req, res) => {
  try {
    const userId   = req.user._id;
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.max(1, parseInt(req.query.limit) || 4);
    const postId   = req.query.postId || null;
    const dateFrom = req.query.dateFrom || null;
    const sortBy   = req.query.sortBy  || null;
    const sortDir  = req.query.sortDir || null;

    const result = await postService.getPostsStatusKPI(userId, page, limit, postId, dateFrom, sortBy, sortDir);

    res.status(200).json({
      success: true,
      message: "Posts status KPI retrieved successfully",
      data:       result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleError(res, error, 500);
  }
};

exports.generateJobPost = async (req, res) => {
  try {
    const user = req.user;
    let jobData = {};

    if (req.file) {
      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      try {
        let fileContent;

        if (fileExtension === ".json") {
          fileContent = fs.readFileSync(filePath, "utf-8");
          jobData = JSON.parse(fileContent);
        } else if (fileExtension === ".csv") {
          fileContent = fs.readFileSync(filePath, "utf-8");
          const lines = fileContent.split("\n").filter(line => line.trim());

          if (lines.length > 0) {
            const headers = lines[0].split(",").map((h) => h.trim());
            const dataLines = lines.slice(1);
            dataLines.forEach((line, lineIndex) => {
              const values = line.split(",").map((v) => v.trim());
              headers.forEach((header, index) => {
                if (index < values.length) {
                  if (lineIndex === 0) {
                    jobData[header] = values[index];
                  } else {
                    jobData[header] = (jobData[header] || "") + " " + values[index];
                  }
                }
              });
            });
          }
        } else {
          fileContent = fs.readFileSync(filePath, "utf-8");
          jobData.description = fileContent.trim();
        }

        fs.unlinkSync(filePath);
      } catch (fileError) {
        console.error("Error reading file:", fileError);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Error parsing file", details: fileError.message });
      }
    } else {
      jobData = req.body;
    }

    const { description, workMode, contractType, language, interviewLanguages } = jobData;

    if (!description) {
      return res.status(400).json({
        error: "Missing job description",
        required: { description: "Detailed description of the job position" },
      });
    }

    // Generation costs an LLM call whether or not the draft is ever saved, so
    // it's gated on its own postGenerations limit — separate from postsLimit,
    // which only decrements when a post is actually saved (post.service.js
    // createPostWithSideEffects).
    const userProfile = await Profile.findOne({ userId: user._id }).populate("activeSubscription");

    if (userProfile?.type === "Company") {
      try {
        const limitCheck = await subscriptionService.checkSubscriptionLimit(
          userProfile._id,
          "postGenerations"
        );

        if (!limitCheck.canUse) {
          return res.status(403).json({
            success: false,
            error: "generation_limit_reached",
            message: limitCheck.message,
            planName: limitCheck.limitData?.planName,
            generationsLimit: limitCheck.limitData?.limit,
            generationsUsed: limitCheck.limitData?.used,
          });
        }
      } catch (limitError) {
        console.error("Error checking generation limit:", limitError);
        return res.status(400).json({
          success: false,
          error: "Error checking plan limits",
          message: limitError.message,
        });
      }
    }

    const result = await postService.generateJobPost(
      description,
      user,
      { workMode, contractType, language, interviewLanguages },
    );

    // Count the attempt regardless of outcome below — the LLM call already
    // happened and cost money by this point, whether the result is a usable
    // draft or a validation rejection.
    if (userProfile?.type === "Company" && userProfile.activeSubscription) {
      try {
        await subscriptionService.incrementUsage(userProfile.activeSubscription._id, "postGenerationsUsed", 1);
      } catch (usageError) {
        console.error("⚠️ [generateJobPost] Warning: Could not update generation usage:", usageError.message);
      }
    }

    if (result?.error === "invalid_input")       return res.status(404).json({ error: "invalid_input" });
    if (result?.error === "insufficient_detail") return res.status(422).json({ error: "insufficient_detail" });

    const { jobDetails, skillAnalysis, ...rest } = result;
    res.json({
      success: true,
      ...rest,
      ...(jobDetails ?? {}),
      requiredSkills: skillAnalysis?.requiredSkills ?? [],
      softSkills:     skillAnalysis?.softSkills     ?? [],
    });
  } catch (error) {
    console.error("Error in generateJobPost:", error);
    res.status(error?.status || 500).json({ error: error.message || "Internal error" });
  }
};

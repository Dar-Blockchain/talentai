const postInterviewAssessmentService = require("../../services/InterviewServices/postInterviewAssessment.service");
const CandidatePostStepProgress = require("../../models/CandidatePostStepProgress.model");
const PostSteps = require("../../models/postSteps.model");
const { sendInterviewAssessmentEmail } = require("../../utils/email-service");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (req, res) => {
  try {
    const assessmentData = {
      ...req.body,
      candidate: req.user._id,
    };

    if (!assessmentData.post) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: post",
      });
    }

    // ✅ Le service fait TOUT (assessment + progression)
    const assessment =
      await postInterviewAssessmentService.createPostInterviewAssessment(
        assessmentData,
      );

    // 📧 SEND EMAIL TO CANDIDATE AFTER SUCCESSFUL CREATION
    try {
      // Get candidate email and name
      const candidateEmail = req.user.email;
      const candidateName = req.user.profile?.firstName || req.user.username || 'Candidate';
      
      // Get post title if available
      let postTitle = 'New Opportunity';
      if (assessment.post && assessment.post.jobDetails) {
        postTitle = assessment.post.jobDetails.title || 'New Opportunity';
      }

      console.log(`📧 Sending interview assessment email to: ${candidateEmail}`);
      
      // Send email asynchronously (don't block response)
      sendInterviewAssessmentEmail(candidateEmail, candidateName, postTitle).catch(err => {
        console.error('⚠️ Warning: Failed to send email, but assessment was created:', err.message);
      });
    } catch (emailError) {
      console.error('⚠️ Email sending error (non-critical):', emailError.message);
      // Don't throw - email is non-critical
    }

    return res.status(201).json({
      success: true,
      message: "Post interview assessment created successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("❌ Controller error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An assessment with this session ID already exists.",
        code: "DUPLICATE_SESSION_ID",
      });
    }

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error creating post interview assessment",
    });
  }
};

// ========== CHECK EXISTENCE ==========
module.exports.checkCandidateAssessmentExists = async (req, res) => {
  try {
    const { postId } = req.params;
    const candidateId = req.user._id;
    const userRole = req.user.role;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: postId",
      });
    }

    // Check if user is a Company - Companies cannot take interviews
    if (userRole === "Company") {
      return res.status(403).json({
        success: false,
        message: "Company accounts cannot participate in interview assessments",
      });
    }

    const exists = await postInterviewAssessmentService.hasExistingAssessment(
      candidateId,
      postId
    );

    return res.status(200).json({
      success: true,
      exists,
      message: exists
        ? "Candidate already has an assessment for this post"
        : "No assessment found for this candidate and post",
    });
  } catch (error) {
    console.error("❌ Controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error checking assessment existence",
    });
  }
};

// ========== READ - Get all assessments ==========
module.exports.getAllPostInterviewAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10, post, candidate, company } = req.query;

    const filters = {};
    if (post) filters.post = post;
    if (candidate) filters.candidate = candidate;
    if (company) filters.company = company;

    const result =
      await postInterviewAssessmentService.getAllPostInterviewAssessments(
        filters,
        parseInt(page),
        parseInt(limit),
      );

    res.status(200).json({
      success: true,
      message: "All assessments retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error getting all assessments:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving assessments",
    });
  }
};

// ========== READ - Get by ID ==========
module.exports.getPostInterviewAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: "Assessment ID is required",
      });
    }

    const assessment =
      await postInterviewAssessmentService.getPostInterviewAssessmentById(
        assessmentId,
      );

    res.status(200).json({
      success: true,
      message: "Post interview assessment retrieved successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("Error getting post interview assessment:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving assessment",
    });
  }
};

// ========== READ - Get all for a post ==========
module.exports.getAssessmentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const filters = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const assessments =
      await postInterviewAssessmentService.getAssessmentsByPost(
        postId,
        filters,
      );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    console.error("Error getting assessments by post:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving assessments",
    });
  }
};

// ========== READ - Get all for a candidate ==========
module.exports.getAssessmentsByCandidate = async (req, res) => {
  try {
    const candidateId = req.user._id;

    const filters = req.query;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const assessments =
      await postInterviewAssessmentService.getAssessmentsByCandidate(
        candidateId,
        filters,
      );

    // Group assessments by post
    const groups = {};
    assessments.forEach((a) => {
      const post = a.post || {};
      const postId = String(post._id || post);
      if (!groups[postId]) {
        groups[postId] = { post, assessments: [] };
      }
      groups[postId].assessments.push(a);
    });

    // For each group, fetch the CandidatePostStepProgress once and build the result
    const grouped = await Promise.all(
      Object.keys(groups).map(async (postId) => {
        const grp = groups[postId];
        const progress = await CandidatePostStepProgress.findOne({
          idCandidate: req.user._id,
          idPost: postId,
        })
          .populate("currentStep")
          .populate("steps.interviewDetails")
          .populate("idCandidate");

        return {
          post: grp.post,
          assessments: grp.assessments,
          candidatePostStepProgress: progress,
        };
      }),
    );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved and grouped by post successfully",
      count: grouped.length,
      data: grouped,
    });
  } catch (error) {
    console.error("Error getting assessments by candidate:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving assessments",
    });
  }
};

// ========== READ - Get all for authenticated company ==========
// supports generic search parameter that searches candidate name, email, and job title
module.exports.getAllPostInterviewAssessmentsForCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const filters = {};
    // Search parameter searches across candidate name, email, and job title
    if (search) filters.search = search;

    const assessmentsResult =
      await postInterviewAssessmentService.getAssessmentsByCompany(
        companyId,
        filters,
        parseInt(page),
        parseInt(limit),
      );
    const assessments = assessmentsResult.data;

    // Group assessments by post
    const groups = {};
    assessments.forEach((a) => {
      const post = a.post || {};
      const postId = String(post._id || post);
      if (!groups[postId]) {
        groups[postId] = { post, assessments: [] };
      }
      groups[postId].assessments.push(a);
    });

    // For each group, attach CandidatePostStepProgress for each assessment's candidate
    const grouped = await Promise.all(
      Object.keys(groups).map(async (postId) => {
        const grp = groups[postId];
        const assessmentsWithProgress = await Promise.all(
          grp.assessments.map(async (ass) => {
            const progress = await CandidatePostStepProgress.findOne({
              idCandidate: ass.candidate,
              idPost: postId,
            })
              .populate("currentStep")
              .populate("steps.interviewDetails")
              .populate(
                "idCandidate",
                "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
              );

            return {
              assessment: ass,
              candidatePostStepProgress: progress,
            };
          }),
        );

        return {
          post: grp.post,
          assessments: assessmentsWithProgress,
        };
      }),
    );

    res.status(200).json({
      success: true,
      message: "Assessments retrieved and grouped by post successfully",
      count: grouped.length,
      data: grouped,
      pagination: {
        currentPage: assessmentsResult.currentPage,
        totalPages: assessmentsResult.totalPages,
        totalCount: assessmentsResult.totalCount,
        limit: assessmentsResult.limit,
        hasNextPage: assessmentsResult.hasNextPage,
        hasPrevPage: assessmentsResult.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error getting assessments by company:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving assessments",
    });
  }
};

// ========== READ - Interview metrics for authenticated company ==========
module.exports.getInterviewMetricsForCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { jobTitle, postTitle, candidateUsername, candidateName, candidateEmail } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const filters = {};
    if (jobTitle || postTitle) filters.jobTitle = jobTitle || postTitle;
    if (candidateUsername) filters.candidateUsername = candidateUsername;
    if (candidateName) filters.candidateName = candidateName;
    if (candidateEmail) filters.candidateEmail = candidateEmail;

    const metrics =
      await postInterviewAssessmentService.getInterviewMetricsForCompany(
        companyId,
        filters,
      );

    res.status(200).json({
      success: true,
      message: "Interview metrics retrieved successfully",
      data: metrics,
    });
  } catch (error) {
    console.error("Error getting interview metrics:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving metrics",
    });
  }
};

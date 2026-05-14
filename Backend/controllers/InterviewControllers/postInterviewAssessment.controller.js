const postInterviewAssessmentService = require("../../services/InterviewServices/postInterviewAssessment.service");
const CandidatePostStepProgress = require("../../models/CandidatePostStepsProgress.model");
const PostSteps = require("../../models/PostSteps.model");
const User = require("../../models/User.model");
const Profile = require("../../models/Profile.model");
const JobApplication = require("../../models/JobApplication.model");
const Post = require("../../models/Post.model");
const { sendInterviewAssessmentEmail, sendInterviewCompletionNotificationToCompany } = require("../../utils/email-service");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (req, res) => {
  try {
    console.log('\n========== API: POST /post-interview-assessments ==========');
    
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

    // 📊 UPDATE JOB APPLICATION STATUS TO interview_completed
    try {
      console.log('\n=== 📊 STARTING JOB APPLICATION STATUS UPDATE ===');
      console.log(`👤 candidateId: ${req.user._id}`);
      console.log(`📄 postId: ${assessmentData.post}`);
      
      const candidateProfile = await Profile.findOne({ userId: req.user._id }).select('_id');
      console.log(`📌 candidateProfile found:`, candidateProfile ? candidateProfile._id : 'NOT FOUND');
      
      if (candidateProfile) {
        console.log(`\n🔍 Searching existing JobApplication...`);
        console.log(`  - profile: ${candidateProfile._id}`);
        console.log(`  - post: ${assessmentData.post}`);
        console.log(`  - status: interview_scheduled`);
        
        // First, let's check what exists in the DB
        const existingApp = await JobApplication.findOne({
          profile: candidateProfile._id,
          post: assessmentData.post
        });
        
        console.log(`✓ Found existing JobApplication:`, existingApp ? 'YES' : 'NO');
        if (existingApp) {
          console.log(`  Current status: "${existingApp.status}"`);
          console.log(`  _id: ${existingApp._id}`);
        }
        
        const updatedApp = await JobApplication.findOneAndUpdate(
          {
            profile: candidateProfile._id,
            post: assessmentData.post
          },
          {
            status: "interview_completed",
            updatedAt: new Date()
          },
          { new: true }
        );
        
        if (updatedApp) {
          console.log(`✅ SUCCESS! Updated JobApplication:`);
          console.log(`  - _id: ${updatedApp._id}`);
          console.log(`  - new status: "${updatedApp.status}"`);
          console.log(`  - candidate: ${req.user._id}`);
          console.log(`  - post: ${assessmentData.post}`);
        } else {
          console.log(`⚠️ NOT UPDATED - No JobApplication found with:`);
          console.log(`  - profile: ${candidateProfile._id}`);
          console.log(`  - post: ${assessmentData.post}`);
          console.log(`  - status: "interview_scheduled"`);
        }
      } else {
        console.log(`❌ ERROR: candidateProfile not found for userId: ${req.user._id}`);
      }
    } catch (statusUpdateError) {
      console.error('\n❌ ERROR in JobApplication update:');
      console.error(`Message: ${statusUpdateError.message}`);
      console.error(`Stack:`, statusUpdateError.stack);
    }

    // 📧 SEND EMAIL TO CANDIDATE AFTER SUCCESSFUL CREATION
    try {
      // Get candidate email and name
      const candidateEmail = req.user.email;
      const candidateName = `${req.user.profile?.firstName || ""} ${req.user.profile?.lastName || ""}`.trim() || req.user.username || 'Candidate';
      
      // Get post title if available
      let postTitle = 'New Opportunity';
      if (assessment.post && assessment.post.jobDetails) {
        postTitle = assessment.post.jobDetails.title || 'New Opportunity';
      }

      console.log(`📧 Sending interview assessment email to: ${candidateEmail}`);

      // Send email to candidate asynchronously (don't block response)
      sendInterviewAssessmentEmail(candidateEmail, candidateName, postTitle).catch(err => {
        console.error('⚠️ Warning: Failed to send candidate email, but assessment was created:', err.message);
      });

      // 🏢 SEND NOTIFICATION TO COMPANY AFTER CANDIDATE COMPLETES INTERVIEW
      try {
        // Get company details from assessment
        const companyId = assessment.company;
        if (companyId) {
          const companyUser = await User.findById(companyId).select('email');
          const companyProfile = await Profile.findOne({ userId: companyId }).select('firstName lastName');

          if (companyUser && companyUser.email) {
            const companyName = companyProfile?.firstName || 'Company';

            console.log(`📧 Sending interview completion notification to company: ${companyUser.email}`);

            // Send email to company asynchronously
            sendInterviewCompletionNotificationToCompany(
              companyUser.email,
              companyName,
              candidateName,
              postTitle,
              candidateEmail
            ).catch(err => {
              console.error('⚠️ Warning: Failed to send company notification Email:', err.message);
            });
          }
        }
      } catch (companyEmailError) {
        console.error('⚠️ Company notification email error (non-critical):', companyEmailError.message);
        // Don't throw - company email is non-critical
      }
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

    // ===== CHECK THRESHOLD SCORE =====
    // Only block when we have BOTH a threshold AND a score that falls below it.
    // If matchScore is null (CV not yet scored), let the candidate through.
    let underThreshold = false;
    let thresholdScore = null;
    let matchScore = null;

    try {
      const post = await Post.findById(postId).select('thresholdScore');
      if (post) {
        thresholdScore = post.thresholdScore;
      }

      const candidateProfile = await Profile.findOne({ userId: candidateId }).select('_id');
      if (candidateProfile) {
        const jobApplication = await JobApplication.findOne({
          profile: candidateProfile._id,
          post: postId
        }).select('matchScore');

        if (jobApplication && jobApplication.matchScore !== null) {
          matchScore = jobApplication.matchScore;
          underThreshold = thresholdScore !== null && matchScore < thresholdScore;
          console.log(`🔍 Threshold: ${thresholdScore}, Score: ${matchScore}, Blocked: ${underThreshold}`);
        }
      }
    } catch (thresholdError) {
      console.warn('⚠️ Warning: Could not check threshold score:', thresholdError.message);
    }

    return res.status(200).json({
      success: true,
      exists,
      underThreshold,
      thresholdScore,
      matchScore,
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

// ========== GET MATCHING DETAILS ==========
module.exports.getMatchingDetails = async (req, res) => {
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

    // Check if user is a Company - Companies cannot check matching details for themselves
    if (userRole === "Company") {
      return res.status(403).json({
        success: false,
        message: "Company accounts cannot check interview matching details",
      });
    }

    const matchingDetails = await postInterviewAssessmentService.getMatchingDetails(
      candidateId,
      postId
    );

    return res.status(200).json({
      success: true,
      data: matchingDetails,
      message: "Matching details retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Controller error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving matching details",
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
                "-authHistory -notifications",
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

// ========== READ - Get assessment by post + candidate user ==========
module.exports.getAssessmentByPostAndCandidate = async (req, res) => {
  try {
    const { postId, candidateUserId } = req.params;
    if (!postId || !candidateUserId) {
      return res.status(400).json({ success: false, message: "postId and candidateUserId are required." });
    }
    const PostInterviewAssessment = require("../../models/PostInterviewAssessment.model");
    const assessment = await PostInterviewAssessment.findOne({ post: postId, candidate: candidateUserId })
      .populate("candidate", "firstName lastName email username profile")
      .populate("post", "jobDetails skillAnalysis")
      .lean();
    if (!assessment) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }
    res.status(200).json({ success: true, data: assessment });
  } catch (error) {
    console.error("Error getting assessment by post+candidate:", error);
    res.status(error.status || 500).json({ success: false, message: error.message || "Error retrieving assessment." });
  }
};

// ========== KPI - Unreviewed AI Interviews > 48h ==========
/**
 * GET /post-interview-assessments/company/mine/kpi/unreviewed-48h
 * 
 * Get count of AI-generated interviews that haven't been reviewed by recruiter for 48+ hours
 * All interviews in PostInterviewAssessment are AI-generated (not human-conducted)
 */
module.exports.getUnreviewedInterviewsKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;

    console.log(`\n📊 [API] Get Unreviewed Interviews KPI for company: ${companyId}`);

    const result = await require("../../services/InterviewServices/postInterviewAssessment.service")
      .getUnreviewedInterviewsOver48Hours(companyId, postId || null, dateFrom || null);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        count: result.count,
        urgent: result.urgent,
        lastCheck: result.lastCheck,
        description: "AI-generated interviews pending recruiter feedback for 48+ hours"
      }
    });
  } catch (error) {
    console.error("❌ Error getting unreviewed interviews KPI:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving unreviewed interviews KPI"
    });
  }
};

/**
 * GET /post-interview-assessments/company/mine/kpi/unreviewed-48h/details
 * 
 * Get paginated list of AI interviews unreviewed for 48+ hours with full details
 * Sorted by oldest first (most urgent)
 */
module.exports.getUnreviewedInterviewsDetails = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { page = 1, limit = 10, postId } = req.query;

    console.log(`\n📋 [API] Get Unreviewed Interviews Details - Page ${page} for company: ${companyId}`);

    const result = await require("../../services/InterviewServices/postInterviewAssessment.service")
      .getUnreviewedInterviewsDetails(
        companyId,
        parseInt(page),
        parseInt(limit),
        postId || null
      );

    res.status(200).json({
      success: true,
      message: "Unreviewed interviews retrieved successfully",
      data: result.interviews,
      pagination: result.pagination,
      metadata: result.metadata
    });
  } catch (error) {
    console.error("❌ Error getting unreviewed interviews details:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving unreviewed interviews details"
    });
  }
};

const postInterviewAssessmentService = require("../../services/InterviewServices/postInterviewAssessment.service");
const CandidatePostStepProgress = require("../../models/CandidatePostStepsProgress.model");
const PostSteps = require("../../models/PostSteps.model");
const User = require("../../features/users/user.model");
const Profile = require("../../features/users/profile.model");
const JobApplication = require("../../models/JobApplication.model");
const Post = require("../../models/Post.model");
const subscriptionService = require("../../features/subscriptions/subscription.service");
const jobApplicationService = require("../../services/jobApplication.service");
const { sendInterviewAssessmentEmail, sendInterviewCompletionNotificationToCompany } = require("../../utils/email-service");

/**
 * Check whether a candidate is blocked by the CV-score threshold for a post.
 * Returns { underThreshold, thresholdScore, matchScore }.
 * A manual recruiter invite (invitedAt set) always bypasses the threshold.
 */
async function checkThresholdStatus(candidateId, postId, thresholdScore) {
  if (thresholdScore == null) return { underThreshold: false, thresholdScore: null, matchScore: null };
  const candidateProfile = await Profile.findOne({ userId: candidateId }).select('_id');
  if (!candidateProfile) return { underThreshold: false, thresholdScore, matchScore: null };
  const app = await JobApplication.findOne({ profile: candidateProfile._id, post: postId }).select('matchScore invitedAt');
  if (!app) return { underThreshold: false, thresholdScore, matchScore: null };
  const matchScore = app.matchScore;
  const manuallyInvited = !!app.invitedAt;
  const underThreshold = !manuallyInvited && matchScore != null && matchScore < thresholdScore;
  return { underThreshold, thresholdScore, matchScore };
}

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

        // 📉 CHECK OVERALL SCORE - Auto-reject if below threshold
        let updateData = {
          status: "interview_completed",
          updatedAt: new Date()
        };

        const overallScore = assessment?.interviewData?.finalReport?.scores?.overall;
        console.log(`\n🎯 Interview Overall Score: ${overallScore}`);

        // Fetch the post to get the interview score threshold and language
        const post = await Post.findById(assessmentData.post).select('thresholdScoreInterview language interviewLanguages');
        const thresholdScoreInterview = post?.thresholdScoreInterview || 20;
        console.log(`📊 Interview Score Threshold: ${thresholdScoreInterview}%`);

        if (overallScore !== null && overallScore !== undefined && overallScore < thresholdScoreInterview) {
          console.log(`❌ SCORE BELOW ${thresholdScoreInterview}% THRESHOLD - AUTO-REJECTING APPLICATION`);
          updateData.recruiterDecision = "rejected";
          updateData.recruiterDecisionAt = new Date();
          updateData.rejectionReason = `Automatic rejection based on interview assessment. Overall performance score: ${overallScore}% (below ${thresholdScoreInterview}% threshold). The candidate did not meet the minimum performance requirements during the AI-conducted interview evaluation.`;
        }
        
        const updatedApp = await JobApplication.findOneAndUpdate(
          {
            profile: candidateProfile._id,
            post: assessmentData.post
          },
          updateData,
          { new: true }
        );
        
        if (updatedApp) {
          console.log(`✅ SUCCESS! Updated JobApplication:`);
          console.log(`  - _id: ${updatedApp._id}`);
          console.log(`  - new status: "${updatedApp.status}"`);
          console.log(`  - recruiterDecision: "${updatedApp.recruiterDecision}"`);
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

      // Get post title and language
      let postTitle = 'New Opportunity';
      let jobLanguage = 'en';
      if (assessment.post && assessment.post.jobDetails) {
        postTitle = assessment.post.jobDetails.title || 'New Opportunity';
      }
      const postForLang = await Post.findById(assessmentData.post).select('language interviewLanguages').lean();
      if (postForLang) jobLanguage = postForLang.language || postForLang.interviewLanguages?.[0] || 'en';

      console.log(`📧 Sending interview assessment email to: ${candidateEmail} (lang: ${jobLanguage})`);

      // Send email to candidate asynchronously (don't block response)
      sendInterviewAssessmentEmail(candidateEmail, candidateName, postTitle, jobLanguage).catch(err => {
        console.error('⚠️ Warning: Failed to send candidate email, but assessment was created:', err.message);
      });

      // 🏢 SEND NOTIFICATION TO COMPANY AFTER CANDIDATE COMPLETES INTERVIEW
      try {
        // Get company details from assessment
        const companyId = assessment.company;
        if (companyId) {
          const companyUser = await User.findById(companyId).select('email language');
          const companyProfile = await Profile.findOne({ userId: companyId }).select('firstName lastName');

          if (companyUser && companyUser.email) {
            const companyName = companyProfile?.firstName || 'Company';

            console.log(`📧 Sending interview completion notification to company: ${companyUser.email} (lang: ${jobLanguage})`);

            // Send email to company asynchronously
            sendInterviewCompletionNotificationToCompany(
              companyUser.email,
              companyName,
              candidateName,
              postTitle,
              candidateEmail,
              jobLanguage
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
    const thresholdPost = await Post.findById(postId).select('thresholdScore');
    const { underThreshold, thresholdScore, matchScore } = await checkThresholdStatus(
      candidateId, postId, thresholdPost?.thresholdScore ?? null
    ).catch((e) => { console.warn('⚠️ Could not check threshold:', e.message); return { underThreshold: false, thresholdScore: null, matchScore: null }; });

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
              .populate("idCandidate", "-notifications");

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

    const doc = await PostInterviewAssessment
      .findOne({ post: postId, candidate: candidateUserId })
      .select({
        createdAt:                                               1,
        // session metadata
        'interviewData.interviewType':                           1,
        // full analytics block
        'interviewData.analytics':                               1,
        // scores
        'interviewData.finalReport.scores':                      1,
        // coverage — full area objects (weight, questionsAsked, completed, indicators)
        'interviewData.finalReport.coverage':                    1,
        // qualitative AI assessment
        'interviewData.finalReport.summary':                     1,
        'interviewData.finalReport.recommendation':              1,
        'interviewData.finalReport.reasoning':                   1,
        'interviewData.finalReport.strengths':                   1,
        'interviewData.finalReport.weaknesses':                  1,
        'interviewData.finalReport.keyDecisionFactors':          1,
        'interviewData.finalReport.hiringRisks':                 1,
        'interviewData.finalReport.developmentAreas':            1,
        'interviewData.finalReport.requiredSkills':              1,
        'interviewData.finalReport.sessionMetrics':              1,
        'interviewData.finalReport.candidateProfile':            1,
        // conversation transcript
        'interviewData.conversation':                            1,
        // recruiter review
        recruiterFeedback:                                       1,
        recruiterFeedbackAt:                                     1,
      })
      .populate('post', 'jobDetails')
      .lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    const fr       = doc.interviewData?.finalReport ?? {};
    const an       = doc.interviewData?.analytics   ?? {};
    const rawAreas = fr.coverage?.areas             ?? {};

    // Shape per-area data.
    // Note: area.aiAnalysis is NEVER populated by the AI engine — omit it.
    // area.depth comes from the static framework description string (not runtime AI).
    const areas = Object.fromEntries(
      Object.entries(rawAreas).map(([key, area]) => [key, {
        percentage:     area.percentage     ?? 0,
        weight:         area.weight         ?? 0,
        questionsAsked: area.questionsAsked ?? 0,
        completed:      area.completed      ?? false,
        indicators: (area.indicators ?? []).map(({ name, covered, evidence }) => ({ name, covered, evidence })),
      }])
    );

    // Derive strongest/weakest/focus from real coverage data (AI doesn't generate these directly)
    const areaEntries = Object.entries(areas);
    const strongestAreas   = areaEntries.filter(([, a]) => a.percentage >= 70).sort((a, b) => b[1].percentage - a[1].percentage).map(([k]) => k);
    const weakestAreas     = areaEntries.filter(([, a]) => a.percentage <  50).sort((a, b) => a[1].percentage - b[1].percentage).map(([k]) => k);
    const incompleteSorted = areaEntries.filter(([, a]) => !a.completed && a.percentage < 60).sort((a, b) => a[1].percentage - b[1].percentage);
    const recommendedFocus = incompleteSorted.map(([k]) => k);
    const nextRecommendedArea = incompleteSorted[0]?.[0] ?? null;
    const completedAreasList  = areaEntries.filter(([, a]) => a.completed).map(([k]) => k);

    return res.status(200).json({
      success: true,
      data: {
        _id:           doc._id,
        createdAt:     doc.createdAt,
        jobId:         doc.post?._id              ?? null,
        jobTitle:      doc.post?.jobDetails?.title ?? null,
        interviewType: doc.interviewData?.interviewType ?? null,

        // ── Executive verdict ─────────────────────────────────────────
        verdict: {
          recommendation: fr.recommendation ?? null,
          overallScore:   fr.scores?.overall ?? fr.coverage?.overall ?? null,
          reasoning:      fr.reasoning       ?? null,
        },

        // ── Component scores (actual keys saved by the AI engine) ─────
        // overall     = composite weighted score
        // quality     = average per-turn response quality (0–100)
        // coverage    = topic coverage percentage (mirrors analytics)
        // skills      = must-have skills match rate (0–100)
        // depth       = answer depth score (surface/moderate/deep → 0–100)
        // communication = communication style score (confidence + verbosity)
        scores: {
          overall:       fr.scores?.overall       ?? null,
          quality:       fr.scores?.quality       ?? null,
          coverage:      fr.scores?.coverage      ?? null,
          skills:        fr.scores?.skills        ?? null,
          depth:         fr.scores?.depth         ?? null,
          communication: fr.scores?.communication ?? null,
        },

        // ── Session analytics ─────────────────────────────────────────
        // duration is in milliseconds (Date subtraction in redis-session-manager)
        analytics: {
          duration:              an.duration,
          messageCount:          an.messageCount,
          silenceEvents:         an.silenceEvents,
          coveragePercentage:    an.coveragePercentage,
          completedAreas:        an.completedAreas,
          totalAreas:            an.totalAreas,
          averageResponseLength: an.averageResponseLength,
          interactionStyle:      an.interactionStyle,
        },

        // ── Coverage breakdown ────────────────────────────────────────
        coverage: {
          overall:             fr.coverage?.overall ?? null,
          completedAreas:      completedAreasList,
          nextRecommendedArea: nextRecommendedArea,
          areas,
        },

        // ── AI qualitative assessment ─────────────────────────────────
        // strengths/weaknesses come from deterministic running-score accumulation.
        // keyDecisionFactors/hiringRisks/developmentAreas are LLM-generated, distinct from each other.
        // strongestAreas/weakestAreas/recommendedFocus are derived from coverage percentages.
        aiAssessment: {
          summary:            fr.summary             ?? null,
          strengths:          fr.strengths            ?? [],
          weaknesses:         fr.weaknesses           ?? [],
          keyDecisionFactors: fr.keyDecisionFactors   ?? [],
          hiringRisks:        fr.hiringRisks          ?? [],
          developmentAreas:   fr.developmentAreas     ?? [],
          strongestAreas,
          weakestAreas,
          recommendedFocus,
        },

        // ── Required skills audit ─────────────────────────────────────
        // Shows which JD must-have skills were demonstrated vs missed.
        requiredSkills: fr.requiredSkills ?? null,

        // ── Session metrics ───────────────────────────────────────────
        sessionMetrics: fr.sessionMetrics ?? null,

        // ── Candidate behavioural profile ─────────────────────────────
        candidateProfile: fr.candidateProfile ?? null,

        // ── Recruiter review status ───────────────────────────────────
        recruiterReview: {
          reviewed:   !!doc.recruiterFeedback,
          feedback:   doc.recruiterFeedback   ?? null,
          reviewedAt: doc.recruiterFeedbackAt ?? null,
        },

        // ── Full transcript ───────────────────────────────────────────
        conversation: doc.interviewData?.conversation ?? [],
      },
    });
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

// ========== CHECK INTERVIEW ELIGIBILITY ==========
module.exports.checkInterviewEligibility = async (req, res) => {
  try {
    const { postId } = req.params;
    const { _id: candidateId, role: userRole } = req.user;

    if (userRole === "Company")  return res.json({ status: "company_blocked" });
    if (userRole === "Employee") return res.json({ status: "employee_blocked" });

    const post = await Post.findById(postId)
      .select("archived expirationDate thresholdScore user jobDetails title");
    if (!post) return res.status(404).json({ status: "not_found" });

    if (post.archived) return res.json({ status: "archived" });

    if (post.expirationDate && new Date(post.expirationDate) < new Date())
      return res.json({ status: "expired" });

    const companyProfile = await Profile.findOne({ userId: post.user }).select("_id activeSubscription");
    if (companyProfile) {
      const limitCheck = await subscriptionService.checkSubscriptionLimit(
        companyProfile._id, "monthlyInterviews"
      );
      if (!limitCheck.canUse) {
        const jobTitle = post.jobDetails?.title || "";
        return res.json({ status: "limit_reached", meta: { jobTitle } });
      }
    }

    // Create job application if it doesn't exist yet (idempotent — 409 is expected on repeat visits)
    const candidateProfile = await Profile.findOne({ userId: candidateId }).select("_id");
    if (candidateProfile) {
      try {
        await jobApplicationService.createJobApplication({
          profile: candidateProfile._id,
          post: postId,
          company: post.user,
        });
      } catch (_) { /* already exists or non-fatal error */ }
    }

    const exists = await postInterviewAssessmentService.hasExistingAssessment(candidateId, postId);
    if (exists) return res.json({ status: "completed", meta: { jobTitle: post.jobDetails?.title || post.title || "" } });
    if (post.thresholdScore != null) {
      const { underThreshold, thresholdScore: req, matchScore: score } =
        await checkThresholdStatus(candidateId, postId, post.thresholdScore);
      if (underThreshold) {
        return res.json({ status: "under_threshold", meta: { required: req, score } });
      }
    }

    return res.json({ status: "eligible" });
  } catch (err) {
    console.error("❌ checkInterviewEligibility error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

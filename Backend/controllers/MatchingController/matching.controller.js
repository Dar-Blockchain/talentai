// controllers/matchingController.js

const JobPost = require("../../models/Post.model");
const Profile = require("../../models/Profile.model");
const {
  calculateMatchScore,
} = require("../../services/MatchingService/matching.service");
const {
  getMatchingConfig,
} = require("../../services/MatchingService/matchingConfig.service");
const PostInterviewAssessment = require("../../models/PostInterviewAssessment.model");
const { prepareSkills } = require("../../helpers/matching.helpers");

exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const idCompany = req.user._id;

    // 🔢 Pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));

    // 🎯 Filter for candidates who passed interview
    const passedInterviewOnly = req.query.passedInterview === "true";

    console.log("Fetching job post with ID:", jobPostId);
    console.log("Filter passed interview only:", passedInterviewOnly);

    // 0️⃣ Charger la config UNE SEULE FOIS
    const matchingConfig = await getMatchingConfig(idCompany, jobPostId);

    /* -----------------------------------------
       1️⃣ Charger uniquement les champs utiles
    ----------------------------------------- */
    const candidates = await Profile.find(
      { type: "Candidate" },
      "skills firstName lastName softSkills targetRole userId workModePreference preferredContractType expectedSalary",
    )
      .populate("userId", "username email")
      .lean();

    console.log(`Found ${candidates.length} candidates.`);

    const jobPost = await JobPost.findById(jobPostId)
      .select(
        "skillAnalysis.requiredSkills " +
          "skillAnalysis.suggestedSkills " +
          "skillAnalysis.softSkills jobDetails",
      )
      .lean();

    if (!jobPost) return res.status(404).json({ error: "Job post not found" });

    /* -----------------------------------------
       2️⃣ Prepare job skills only once
    ----------------------------------------- */
    const requiredSkills = prepareSkills(
      jobPost.skillAnalysis?.requiredSkills || [],
    );
    const requiredNames = new Set(requiredSkills.map((s) => s.name));

    const jobData = {
      ...jobPost.jobDetails,
      skillAnalysis: jobPost.skillAnalysis,
    };

    /* -----------------------------------------
       2️⃣c Get candidates who passed interview for this job
    ----------------------------------------- */
    // Always fetch passed assessments to show in response
    // Note: removed "completed: true" filter because assessments are created with completed: false
    // and the field is never updated to true. The existence of an assessment record for the post
    // is sufficient to indicate the candidate has completed the interview.
    const passedAssessments = await PostInterviewAssessment.find(
      { post: jobPostId },
      {
        candidate: 1,
        "interviewData.finalReport.scores": 1,
        "interviewData.finalReport.coverage": 1,
      },
    ).lean();

    const passedInterviewCandidateIds = new Set(
      passedAssessments.map((a) => String(a.candidate)),
    );

    // Build maps of candidate ID -> interview score and assessment ID
    const interviewScoreMap = new Map();
    const assessmentIdMap = new Map();
    for (const a of passedAssessments) {
      const candidateId = String(a.candidate);
      const interviewScore =
        a.interviewData?.finalReport?.coverage?.overall || 0;
      // Keep the highest score if multiple assessments exist
      if (
        !interviewScoreMap.has(candidateId) ||
        interviewScore > interviewScoreMap.get(candidateId)
      ) {
        interviewScoreMap.set(candidateId, interviewScore);
        assessmentIdMap.set(candidateId, String(a._id));
      }
    }

    console.log(
      `Found ${passedInterviewCandidateIds.size} candidates who passed interview`,
    );
    console.log("Interview score map:", Object.fromEntries(interviewScoreMap));
    // Log raw assessment data for debugging
    for (const a of passedAssessments) {
      console.log(
        `Assessment for candidate ${a.candidate}:`,
        JSON.stringify(a.interviewData?.finalReport?.scores || "NO SCORES"),
      );
    }

    /* -----------------------------------------
       3️⃣ Parallel processing
    ----------------------------------------- */
    const matchPromises = candidates.map(async (candidate) => {
      if (!candidate.userId) return null;

      const candidateIdStr = String(candidate.userId._id);

      // Check if candidate passed interview for this job
      const hasPassedInterview =
        passedInterviewCandidateIds.has(candidateIdStr);

      // If filtering by passed interview, skip candidates who haven't passed
      if (passedInterviewOnly && !hasPassedInterview) {
        return null;
      }

      const candidateSkills = prepareSkills(candidate.skills);

      // Calculate score with individual protection: if an error occurs
      // for a candidate, we log and continue (doesn't break everything)
      let score;
      try {
        score = await calculateMatchScore(
          requiredSkills,
          candidateSkills,
          jobData,
          candidate,
          idCompany,
          matchingConfig,
        );
      } catch (err) {
        console.error(`Error matching candidate ${candidateIdStr}:`, err);
        return null;
      }

      // Skip candidates with no score, unless they passed interview and we're filtering for that
      if (
        (!score || score === 0) &&
        !(passedInterviewOnly && hasPassedInterview)
      )
        return null;

      const matchScore = score?.score || 0;
      const interviewScore = hasPassedInterview
        ? interviewScoreMap.get(candidateIdStr) || 0
        : null;
      // Unlock feature has been removed - always set to false
      const isUnlocked = false;

      return {
        candidateId: candidate.userId._id,
        name: candidate.userId.username,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        targetRole: candidate.targetRole,
        email: candidate.userId.email,
        score:
          hasPassedInterview && interviewScore > matchScore
            ? interviewScore
            : matchScore,
        matchScore,
        unlocked: isUnlocked,
        unlockPrice: 5,
        matchedSkills: candidateSkills.filter((cs) =>
          requiredNames.has(cs.name),
        ),
        requiredSkills,
        passedInterview: hasPassedInterview,
        interviewScore,
        assessmentId: hasPassedInterview
          ? assessmentIdMap.get(candidateIdStr) || null
          : null,
      };
    });

    const matches = (await Promise.all(matchPromises)).filter(Boolean);
    matches.sort((a, b) => b.score - a.score);

    /* -----------------------------------------
       4️⃣ Pagination
    ----------------------------------------- */
    const totalMatches = matches.length;
    const totalPages = Math.ceil(totalMatches / limit);
    const offset = (page - 1) * limit;
    const paginatedMatches = matches.slice(offset, offset + limit);

    res.json({
      success: true,
      jobTitle: jobPost.jobDetails?.title || "Unknown Job",
      matches: paginatedMatches,
      pagination: {
        page,
        limit,
        totalMatches,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in matchCandidatesToJob:", error);
    res.status(500).json({
      error: "Matching failed",
      details: error.message,
    });
  }
};

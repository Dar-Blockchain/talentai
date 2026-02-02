// controllers/matchingController.js

const JobPost = require("../../models/Post.model");
const Profile = require("../../models/Profile.model");
const { calculateMatchScore } = require("../../services/MatchingService/matching.service");
const { getMatchingConfig } = require("../../services/MatchingService/matchingConfig.service");
const UnlockCandidate = require("../../models/UnlockCandidate.model");
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
    const passedInterviewOnly = req.query.passedInterview === 'true';

    console.log("Fetching job post with ID:", jobPostId);
    console.log("Filter passed interview only:", passedInterviewOnly);
    
    // 0️⃣ Charger la config UNE SEULE FOIS
    const matchingConfig = await getMatchingConfig(idCompany, jobPostId);

    /* -----------------------------------------
       1️⃣ Charger uniquement les champs utiles
    ----------------------------------------- */
    const candidates = await Profile.find(
      { type: "Candidate" },
      "skills firstName lastName softSkills targetRole companyBid userId workModePreference preferredContractType expectedSalary"
    )
      .populate("userId", "username email")
      .populate("companyBid.company", "username email")
      .lean();

    console.log(`Found ${candidates.length} candidates.`);

    const jobPost = await JobPost.findById(jobPostId)
      .select(
        "skillAnalysis.requiredSkills " +
          "skillAnalysis.suggestedSkills " +
          "skillAnalysis.softSkills jobDetails"
      )
      .lean();

    if (!jobPost) return res.status(404).json({ error: "Job post not found" });

    /* -----------------------------------------
       2️⃣ Préparer les skills du job une seule fois
    ----------------------------------------- */
    const requiredSkills = prepareSkills(jobPost.skillAnalysis?.requiredSkills || []);
    const requiredNames = new Set(requiredSkills.map((s) => s.name));

    const jobData = {
      ...jobPost.jobDetails,
      skillAnalysis: jobPost.skillAnalysis,
    };

    /* -----------------------------------------
       2️⃣b Charger tous les unlocked en une seule requête
    ----------------------------------------- */
    // Extraire tous les ids de candidats présents
    const candidateIds = candidates
      .filter(c => c.userId?._id)
      .map(c => c.userId._id);

    // Requête Mongo pour récupérer tous les unlocks
    const unlockedRecords = await UnlockCandidate.find(
      { idCompany, idCandidate: { $in: candidateIds } },
      { idCandidate: 1, _id: 0 }
    ).lean();

    // Créer un Set pour lookup rapide
    const unlockedSet = new Set(unlockedRecords.map(u => String(u.idCandidate)));

    /* -----------------------------------------
       2️⃣c Get candidates who passed interview for this job
    ----------------------------------------- */
    // Always fetch passed assessments to show in response
    const passedAssessments = await PostInterviewAssessment.find(
      { post: jobPostId, completed: true },
      { candidate: 1, _id: 0 }
    ).lean();

    const passedInterviewCandidateIds = new Set(
      passedAssessments.map(a => String(a.candidate))
    );
    console.log(`Found ${passedInterviewCandidateIds.size} candidates who passed interview`);

    /* -----------------------------------------
       3️⃣ Traitement en parallèle
    ----------------------------------------- */
    const matchPromises = candidates.map(async (candidate) => {
      if (!candidate.userId) return null;

      const candidateIdStr = String(candidate.userId._id);

      // Check if candidate passed interview for this job
      const hasPassedInterview = passedInterviewCandidateIds.has(candidateIdStr);

      // If filtering by passed interview, skip candidates who haven't passed
      if (passedInterviewOnly && !hasPassedInterview) {
        return null;
      }

      const candidateSkills = prepareSkills(candidate.skills);

        // calcul du score avec protection individuelle : si une erreur survient
        // pour un candidat, on loggue et on continue (ne casse pas tout)
        let score;
        try {
          score = await calculateMatchScore(
            requiredSkills,
            candidateSkills,
            jobData,
            candidate,
            idCompany,
            matchingConfig,
            unlockedSet
          );
        } catch (err) {
          console.error(`Error matching candidate ${candidateIdStr}:`, err);
          return null;
        }

      if (!score || score === 0) return null;

      return {
        candidateId: candidate.userId._id,
        name: candidate.userId.username,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        targetRole: candidate.targetRole,
        email: candidate.userId.email,
        score: score.score,
        unlocked: score.unlocked,
        unlockPrice: 5,
        finalBid: candidate.companyBid?.finalBid || null,
        biddingCompany: candidate.companyBid?.company?.username || null,
        matchedSkills: candidateSkills.filter((cs) => requiredNames.has(cs.name)),
        requiredSkills,
        passedInterview: hasPassedInterview,
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

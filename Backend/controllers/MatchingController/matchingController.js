// controllers/matchingController.js

const JobPost = require("../../models/PostModel");
const Profile = require("../../models/ProfileModel");
const {
  calculateMatchScore,
  normalizeSkillName,
} = require("../../services/MatchingService/matchingService");
const { getMatchingConfig } = require("../../services/MatchingService/matchingConfigService");

/* Helper */
const prepareSkills = (skills) =>
  (skills || [])
    .filter((s) => s?.name)
    .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const idCompany = req.user._id;

    console.log("Fetching job post with ID:", jobPostId);
    
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
    const requiredSkills = prepareSkills(
      jobPost.skillAnalysis?.requiredSkills || []
    );
    console.log("Required skills for job:",requiredSkills.map((s) => s.name))

    const requiredNames = new Set(requiredSkills.map((s) => s.name));

    /* Cast jobDetails propre (important pour service) */
    const jobData = {
      ...jobPost.jobDetails,
      skillAnalysis: jobPost.skillAnalysis,
    };

    /* -----------------------------------------
       3️⃣ Traitement en parallèle (max performance)
    ----------------------------------------- */
    const matchPromises = candidates.map(async (candidate) => {
      if (!candidate.userId) return null;

      const candidateSkills = prepareSkills(candidate.skills);

      // Le service gère tout ⇒ ne rien changer
      const score = await calculateMatchScore(
        requiredSkills,
        candidateSkills,
        jobData,
        candidate,
        idCompany,
        jobPostId,
        matchingConfig
      );

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
        matchedSkills: candidateSkills.filter((cs) =>
          requiredNames.has(cs.name)
        ),
        requiredSkills,
      };
    });

    const matches = (await Promise.all(matchPromises)).filter(Boolean);

    matches.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      jobTitle: jobPost.jobDetails?.title || "Unknown Job",
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error("Error in matchCandidatesToJob:", error);
    res.status(500).json({
      error: "Matching failed",
      details: error.message,
    });
  }
};

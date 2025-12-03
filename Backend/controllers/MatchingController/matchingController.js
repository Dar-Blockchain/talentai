// controllers/matchingController.js

const JobPost = require("../../models/PostModel");
const Profile = require("../../models/ProfileModel");
const { calculateMatchScore, normalizeSkillName } = require("../../services/MatchingService/matchingService");

exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;
    const idCompany = req.user._id;
    console.log("Fetching job post with ID:", jobPostId);

    const candidates = await Profile.find({ type: "Candidate" })
      .populate("userId", "username email")
      .populate("companyBid.company", "username email")
      .lean();

    console.log(`Found ${candidates.length} candidates.`);

    const jobPost = await JobPost.findById(jobPostId)
      .select("skillAnalysis.requiredSkills skillAnalysis.suggestedSkills jobDetails")
      .lean();

    if (!jobPost) return res.status(404).json({ error: "Job post not found" });

    const requiredSkills = (jobPost.skillAnalysis?.requiredSkills || [])
      .filter((s) => s && s.name)
      .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

    console.log("Required skills for job:", requiredSkills.map(s => s.name));

    const matches = [];
    for (const candidate of candidates) {
      if (!candidate.userId) continue;

      const candidateSkills = (candidate.skills || [])
        .filter((s) => s && s.name)
        .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

      const score = await calculateMatchScore(requiredSkills, candidateSkills, jobPost.jobDetails, candidate,idCompany,jobPostId);
      if (!score || score === 0) continue; // éliminer ceux sans hard skill matching

      matches.push({
        candidateId: candidate.userId._id,
        name: candidate.userId?.username ,
        firstName: candidate.firstName ,
        lastName: candidate.lastName ,
        targetRole: candidate.targetRole,
        email: candidate.userId?.email ,
        score: score.score,
        unlocked: score.unlocked,
        unlockPrice: 5,
        finalBid: candidate.companyBid?.finalBid || null,
        biddingCompany: candidate.companyBid?.company?.username || null,
        matchedSkills: candidateSkills.filter((cs) =>
          requiredSkills.some((js) => js.name === cs.name)
        ),
        requiredSkills,
      });
    }

    matches.sort((a, b) => b.score - a.score);

    console.log(`Total matches found: ${matches.length}`);
    matches.forEach((m) => console.log(`Candidate ${m.name} -> Score: ${m.score}`));

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
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

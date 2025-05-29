const { calculateSkillMatchScore } = require("../services/matchingService");
const JobPost = require("../models/PostModel");
const Profile = require("../models/ProfileModel");

exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;

    // 1. Fetch candidate profiles + populate companyBid.company
    const candidates = await Profile.find({ type: "Candidate" })
      .populate("userId", "username email")
      .populate("companyBid.company", "username email") // Populate company info
      .select("userId skills companyDetails.name companyBid")
      .lean();

    // 2. Fetch job post and skills
    const jobPost = await JobPost.findById(jobPostId)
      .select("skillAnalysis.requiredSkills jobDetails.title")
      .lean();

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    // 3. Compute matches with additional info
    const matches = candidates
      .map((candidate) => {
        const score = calculateSkillMatchScore(
          jobPost.skillAnalysis.requiredSkills,
          candidate.skills
        );

        return {
          candidateId: candidate.userId,
          name: candidate.userId?.username || "Anonymous",
          score,
          finalBid: candidate.companyBid?.finalBid || null,
          biddingCompany: candidate.companyBid?.company?.username || null,
          matchedSkills: candidate.skills.filter((candidateSkill) =>
            jobPost.skillAnalysis.requiredSkills.some(
              (jobSkill) =>
                jobSkill.name.toLowerCase() ===
                candidateSkill.name.toLowerCase()
            )
          ),
          requiredSkills: jobPost.skillAnalysis.requiredSkills,
        };
      })
      .filter(
        (match) => match.score > 0 && match.candidateId && match.candidateId._id
      )
      .sort((a, b) => b.score - a.score);

    // 4. Response
    res.json({
      success: true,
      jobTitle: jobPost.jobDetails.title,
      matches,
      count: matches.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Matching failed",
      details: error.message,
    });
  }
};

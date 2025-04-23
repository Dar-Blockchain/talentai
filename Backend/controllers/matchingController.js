const { calculateSkillMatchScore } = require('../services/matchingService');
const JobPost = require('../models/PostModel');
const Profile = require('../models/ProfileModel');

exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;

    // Fetch job post skills (with levels)
    const jobPost = await JobPost.findById(jobPostId)
      .select('skillAnalysis.requiredSkills jobDetails.title')
      .lean();

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    // Fetch candidate profiles (with skill levels)
    const candidates = await Profile.find({ type: 'Candidate' })
      .select('userId skills companyDetails.name')
      .lean();

    // Calculate matches
    const matches = candidates.map(candidate => {
      const score = calculateSkillMatchScore(
        jobPost.skillAnalysis.requiredSkills,
        candidate.skills
      );

      return {
        candidateId: candidate.userId,
        name: candidate.companyDetails?.name || 'Anonymous',
        score,
        matchedSkills: candidate.skills.filter(candidateSkill => 
          jobPost.skillAnalysis.requiredSkills.some(jobSkill => 
            jobSkill.name.toLowerCase() === candidateSkill.name.toLowerCase()
          )
        ),
        requiredSkills: jobPost.skillAnalysis.requiredSkills
      };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      jobTitle: jobPost.jobDetails.title,
      matches,
      count: matches.length
    });
  } catch (error) {
    res.status(500).json({
      error: "Matching failed",
      details: error.message
    });
  }
};

const { calculateSkillMatchScore } = require("../services/matchingService");
const JobPost = require("../models/PostModel");
const Profile = require("../models/ProfileModel");

exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;

    // 1. Récupérer les profils des candidats + peupler companyBid.company
    const candidates = await Profile.find({ type: "Candidate" })
      .populate("userId", "username email")
      .populate("companyBid.company", "username email")
      .select("userId skills companyDetails.name companyBid")
      .lean();

   //   console.log("candidates",candidates)

    // 2. Récupérer l'annonce de poste et les compétences requises
    const jobPost = await JobPost.findById(jobPostId)
      .select("skillAnalysis.requiredSkills jobDetails.title")
      .lean();

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    // Log pour vérifier les compétences requises
   // console.log("Job Post Skills:", jobPost.skillAnalysis.requiredSkills);

    // 3. Calculer les correspondances avec les informations supplémentaires
    const matches = candidates
      .map((candidate) => {
        // Vérifier si userId existe avant de procéder
        if (!candidate.userId) {
          console.log("Candidate without userId:", candidate);
          return null; // Ignorer ce candidat
        }

        const score = calculateSkillMatchScore(
          jobPost.skillAnalysis.requiredSkills,
          candidate.skills
        );

        // Log pour vérifier chaque candidat et son score
        console.log("Candidate:", candidate.userId.username, "Score:", score);

        return {
          candidateId: candidate.userId,
          name: candidate.userId?.username || "Anonymous", // S'assurer que username existe
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
      .filter((match) => match !== null && match.score > 0) // Filtrer les candidats nulls
      .sort((a, b) => b.score - a.score);

      console.log("matches",matches)

    // 4. Retourner la réponse
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

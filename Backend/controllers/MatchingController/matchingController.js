const { calculateSkillMatchScore } = require("../../services/MatchingService/matchingService");
const JobPost = require("../../models/PostModel");
const Profile = require("../../models/ProfileModel");

function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

// Ensuite dans ton controller :
exports.matchCandidatesToJob = async (req, res) => {
  try {
    const { jobPostId } = req.params;

    // 1. Récupérer les profils des candidats + peupler companyBid.company
    const candidates = await Profile.find({ type: "Candidate" })
      .populate("userId", "username email firstName lastName")
      .populate("companyBid.company", "username email")
      .select("userId skills companyDetails.name companyBid")
      .lean();

    // 2. Récupérer l'annonce de poste et les compétences requises
    const jobPost = await JobPost.findById(jobPostId)
      .select("skillAnalysis.requiredSkills jobDetails.title")
      .lean();

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    // Vérifier que skillAnalysis existe
    if (!jobPost.skillAnalysis) {
      return res.status(400).json({
        error: "Job post has no skill analysis data",
      });
    }

    // Vérifier et normaliser les requiredSkills avec protection contre les valeurs null
    const requiredSkills = (jobPost.skillAnalysis?.requiredSkills || [])
      .filter((skill) => skill && skill.name) // Filtrer les skills null ou sans nom
      .map((skill) => ({
        ...skill,
        name: normalizeSkillName(skill.name),
      }));

    // 3. Calculer les correspondances avec les informations supplémentaires
    const matches = candidates
      .map((candidate) => {
        if (!candidate.userId) {
          return null; // Ignorer ce candidat
        }

        // Vérifier et normaliser les skills du candidat avec protection contre les valeurs null
        const candidateSkills = (candidate.skills || [])
          .filter((skill) => skill && skill.name) // Filtrer les skills null ou sans nom
          .map((skill) => ({
            ...skill,
            name: normalizeSkillName(skill.name),
          }));

        const score = calculateSkillMatchScore(requiredSkills, candidateSkills);

        return {
          candidateId: candidate.userId,
          name: candidate.userId?.username || "Anonymous",
          score,
          finalBid: candidate.companyBid?.finalBid || null,
          biddingCompany: candidate.companyBid?.company?.username || null,
          matchedSkills: candidateSkills.filter((candidateSkill) =>
            requiredSkills.some(
              (jobSkill) => jobSkill.name === candidateSkill.name
            )
          ),
          requiredSkills,
        };
      })
      .filter((match) => match !== null && match.score > 0)
      .sort((a, b) => b.score - a.score);

    // 4. Retourner la réponse avec protection contre les valeurs null
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

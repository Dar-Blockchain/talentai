const { calculateSkillMatchScore } = require("../services/matchingService");
const JobPost = require("../models/PostModel");
const Profile = require("../models/ProfileModel");

function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}
// Ajoute la fonction utilitaire au début du fichier :
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
      .populate("userId", "username email")
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

    // Appliquer la normalisation sur requiredSkills (pour être sûr)
    const requiredSkills = jobPost.skillAnalysis.requiredSkills.map(skill => ({
      ...skill,
      name: normalizeSkillName(skill.name)
    }));

    // 3. Calculer les correspondances avec les informations supplémentaires
    const matches = candidates
      .map((candidate) => {
        if (!candidate.userId) {
          return null; // Ignorer ce candidat
        }

        // Appliquer la normalisation sur les skills du candidat
        const candidateSkills = candidate.skills.map(skill => ({
          ...skill,
          name: normalizeSkillName(skill.name)
        }));

        const score = calculateSkillMatchScore(
          requiredSkills,
          candidateSkills
        );

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

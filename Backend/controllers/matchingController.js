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

    console.log("candidates", candidates);

    // 2. Récupérer l'annonce de poste et les compétences requises
    const jobPost = await JobPost.findById(jobPostId)
      .select("skillAnalysis.requiredSkills jobDetails.title")
      .lean();

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    console.log("Job Post Skills:", jobPost.skillAnalysis.requiredSkills);

    // 3. Calculer les correspondances avec les informations supplémentaires
    const matches = candidates
      .map((candidate) => {
        // Vérifier si userId existe avant de procéder
        if (!candidate.userId) {
          console.log("Candidate without userId:", candidate);
          return null; // Ignorer ce candidat
        }

        // Calculer le score pour chaque candidat avec ses compétences et celles du job
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
                jobSkill.name.toLowerCase() === candidateSkill.name.toLowerCase() &&
                convertLevelToNumber(jobSkill.level) === candidateSkill.Levelconfirmed // Comparaison des niveaux aussi
            )
          ),
          requiredSkills: jobPost.skillAnalysis.requiredSkills,
        };
      })
      .filter((match) => match !== null && match.score > 0) // Filtrer les candidats nulls
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

// Calcul du score de correspondance pour chaque candidat
const calculateSkillMatchScore = (jobSkills, candidateSkills) => {
  let totalScore = 0;
  const maxPossibleScore = jobSkills.length * 100; // 100% par compétence

  jobSkills.forEach((jobSkill) => {
    // Trouver la compétence du candidat avec le même nom
    const candidateSkill = candidateSkills.find(
      (s) => s.name.trim().toLowerCase() === jobSkill.name.trim().toLowerCase()
    );

    if (candidateSkill) {
      console.log("Job Skill:", jobSkill);
      console.log("Candidate Skill:", candidateSkill);

      // Comparer le niveau de la compétence du candidat avec celui du job
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = candidateSkill.Levelconfirmed; // Utiliser Levelconfirmed du candidat

      // Si les niveaux correspondent
      if (jobLevel && candidateLevel) {
        totalScore += 100; // Score parfait si les niveaux correspondent
      } else {
        console.log(`No match for ${jobSkill.name}: Job level ${jobLevel} vs Candidate level ${candidateLevel}`);
      }
    }
  });

  // Calcul du pourcentage global de correspondance
  const matchPercentage = Math.round((totalScore / maxPossibleScore) * 1000) / 10; // Arrondir à 1 décimale
  console.log("Total Score:", totalScore, "Max Possible Score:", maxPossibleScore);
  return matchPercentage;
};

// Helper: Convertir les niveaux de texte en chiffres
const convertLevelToNumber = (level) => {
  const levels = {
    Beginner: 1,
    Intermediate: 3,
    Advanced: 4,
    Expert: 5,
  };
  return levels[level] || 1; // Par défaut à Beginner si inconnu
};

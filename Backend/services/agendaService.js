const Agenda = require("agenda");
const Agent = require("../models/AgentModel");
const JobPost = require("../models/PostModel");
const Profile = require("../models/ProfileModel");
const { calculateSkillMatchScore } = require("../services/matchingService");

let agendaInstance;
let isInitialized = false;
let lastHeartbeatAt = null;
let countdownInterval = null;
let hasWarnedForCurrentCycle = false;

// utilitaire pour normaliser les noms de skills
function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

async function computeMatches(jobPostId) {
  const candidates = await Profile.find({ type: "Candidate" })
    .populate("userId", "username email")
    .populate("companyBid.company", "username email")
    .select("userId skills companyDetails.name companyBid")
    .lean();

  const jobPost = await JobPost.findById(jobPostId)
    .select("skillAnalysis.requiredSkills jobDetails.title")
    .lean();

  if (!jobPost || !jobPost.skillAnalysis) return [];

  const requiredSkills = (jobPost.skillAnalysis.requiredSkills || [])
    .filter((s) => s && s.name)
    .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

  const matches = candidates
    .map((candidate) => {
      if (!candidate.userId) return null;
      const candidateSkills = (candidate.skills || [])
        .filter((s) => s && s.name)
        .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

      const score = calculateSkillMatchScore(requiredSkills, candidateSkills);

      return {
        candidateId: candidate.userId._id,
        name: candidate.userId.username || "Anonymous",
        score,
        finalBid: candidate.companyBid?.finalBid || null,
        biddingCompany: candidate.companyBid?.company?.username || null,
        matchedSkills: candidateSkills.filter((cs) =>
          requiredSkills.some((rs) => rs.name === cs.name)
        ),
        requiredSkills,
      };
    })
    .filter((m) => m && m.score > 0)
    .sort((a, b) => b.score - a.score);

  return { jobTitle: jobPost.jobDetails?.title || "Unknown", matches };
}

async function initializeAgenda() {
  if (isInitialized) return agendaInstance;

  agendaInstance = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
    processEvery: "1 second", // vérifie toutes les secondes pour précision
  });

  agendaInstance.define("agent:heartbeat", async () => {
    try {
      lastHeartbeatAt = new Date();
      hasWarnedForCurrentCycle = false;

      const agents = await Agent.find({}, { _id: 1, name: 1, postId: 1 })
        .populate({ path: "postId", select: "jobDetails user" })
        .lean();

      if (!agents || agents.length === 0) {
        console.log("🔄 [Agenda] Aucun agent trouvé");
        return;
      }

      let totalMatches = 0;
      for (const agent of agents) {
        const agentLabel = agent.name || agent._id?.toString();

        if (!agent.postId?._id) {
          console.log(`⚠️  [Agenda] Agent ${agentLabel} sans postId`);
          continue;
        }

        const { jobTitle, matches } = await computeMatches(agent.postId._id);
        totalMatches += matches.length;
        // Log seulement s'il y a des matches ou des erreurs
        if (matches.length > 0) {
          console.log(`✅ [Agenda] Agent ${agentLabel} | Job: ${jobTitle} | ${matches.length} candidat(s) matché(s) | #1 Name : ${matches[0].name}  candidat matché Score :  ${matches[0].score} FinalBid : ${matches[0].finalBid} _id : ${matches[0].candidateId}`);
        }
      }

      // Log de résumé seulement
      console.log(`🔄 [Agenda] Heartbeat terminé - ${agents.length} agent(s) traité(s), ${totalMatches} match(es) total`);
    } catch (err) {
      console.error("❌ [Agenda] Erreur heartbeat:", err.message);
    }
  });

  agendaInstance.on("ready", async () => {
    await agendaInstance.start();
    await agendaInstance.every("1 minute", "agent:heartbeat"); // exécution chaque minute
    await agendaInstance.now("agent:heartbeat");
    console.log("⏱️ Agenda démarré avec job agent:heartbeat toutes les 1 min");

    // Compteur décroissant (moins fréquent pour éviter le spam)
    if (!countdownInterval) {
      countdownInterval = setInterval(() => {
        if (!lastHeartbeatAt) return;
        const nextExpectedAt = lastHeartbeatAt.getTime() + 60000; // +1 minute
        const remainingMs = nextExpectedAt - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
        
        // Afficher seulement toutes les 10 secondes pour éviter le spam
        if (remainingSeconds % 10 === 0 || remainingSeconds <= 5) {
          process.stdout.write(`\r🕒 Prochain heartbeat dans: ${remainingSeconds}s `);
        }

        // Watchdog: relance si pas exécuté après 62s
        if (remainingMs < -2000 && !hasWarnedForCurrentCycle) {
          console.warn("\n⚠️  [Agenda] Aucun heartbeat détecté (>62s). Relance...");
          hasWarnedForCurrentCycle = true;
          agendaInstance.now("agent:heartbeat").catch(e => {
            console.error("❌ [Agenda] Échec de relance:", e?.message);
          });
        }
      }, 2000); // Vérification toutes les 2 secondes au lieu d'1
    }
  });

  agendaInstance.on("error", (err) => {
    console.error("❌ Agenda error:", err);
  });

  isInitialized = true;
  return agendaInstance;
}

module.exports = { initializeAgenda };

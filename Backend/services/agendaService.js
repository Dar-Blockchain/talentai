const Agenda = require("agenda");
const Agent = require("../models/AgentModel");
const JobPost = require("../models/PostModel");
const Profile = require("../models/ProfileModel");
const { calculateSkillMatchScore } = require("../services/matchingService");
const axios = require("axios");

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
        
          // --- Envoi POST seulement pour le premier match avec score > 70 ---
        const topMatch = matches.find((m) => m.score > 70);
        if (topMatch) {
          try {
            await axios.post("http://localhost:5000/hr-agents/submit-evaluation-message", {
              agentAId: agent._id,
              agentBId: "68bff5c35dd4c475d2209524", // master
              candidateId: topMatch.candidateId,
              postId: agent.postId._id,
              message: "Please review this candidate",
              bidAmount: topMatch.finalBid || 20
            });
            console.log(`📤 [Agenda] Message envoyé pour candidat ${topMatch.name} avec score ${topMatch.score}`);
          } catch (err) {
            console.error(`❌ [Agenda] Échec envoi message pour candidat ${topMatch.name}:`, err.message);
          }
        } else {
          console.log(`⚠️ [Agenda] Aucun candidat avec score > 70 pour agent ${agentLabel}`);
        }

          
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
    await agendaInstance.every("5 minutes", "agent:heartbeat"); // exécution toutes les 5 minutes
    await agendaInstance.now("agent:heartbeat");
    console.log("⏱️ Agenda démarré avec job agent:heartbeat toutes les 5 minutes");
  
    // Compteur décroissant
    if (!countdownInterval) {
      countdownInterval = setInterval(() => {
        if (!lastHeartbeatAt) return;
        const nextExpectedAt = lastHeartbeatAt.getTime() + 300000; // +5 minutes en ms
        const remainingMs = nextExpectedAt - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  
        if (remainingSeconds % 60 === 0 || remainingSeconds <= 5) { // affichage chaque minute + dernières 5 sec
          process.stdout.write(`\r🕒 Prochain heartbeat dans: ${remainingSeconds}s `);
        }
  
        // Watchdog: relance si pas exécuté après 5min + 2s
        if (remainingMs < -2000 && !hasWarnedForCurrentCycle) {
          console.warn("\n⚠️  [Agenda] Aucun heartbeat détecté (>5min2s). Relance...");
          hasWarnedForCurrentCycle = true;
          agendaInstance.now("agent:heartbeat").catch(e => {
            console.error("❌ [Agenda] Échec de relance:", e?.message);
          });
        }
      }, 2000);
    }
  });
  

  agendaInstance.on("error", (err) => {
    console.error("❌ Agenda error:", err);
  });

  isInitialized = true;
  return agendaInstance;
}

module.exports = { initializeAgenda };

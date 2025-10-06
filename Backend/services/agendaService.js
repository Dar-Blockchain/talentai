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

  // Logs d'observabilité des jobs Agenda
  agendaInstance.on("start", (job) => {
    console.log(`▶️  [Agenda] Job démarré: ${job.attrs.name} (id=${job.attrs._id})`);
  });
  agendaInstance.on("success", (job) => {
    console.log(`✅ [Agenda] Job réussi: ${job.attrs.name}`);
  });
  agendaInstance.on("fail", (err, job) => {
    console.error(`❌ [Agenda] Job échoué: ${job?.attrs?.name} → ${err?.message}`);
  });

  agendaInstance.define(
    "agent:heartbeat",
    { concurrency: 1, lockLifetime: 30000 },
    async () => {
    try {
      console.log("🔄 [Agenda] Heartbeat démarré");
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
            console.log("topMatch.candidateId", topMatch.candidateId.toString());
            const res = await axios.put(`${process.env.BASE_URL_Backend}/profiles/updateFinalBid`, {
              userId: topMatch.candidateId?.toString(), // candidat concerné
              newBid: 20,
              companyId: agent._id?.toString(),        // ⚠️ pas agent.Company !
              postId: agent.postId._id?.toString()
            });
            
            console.log(
              `📤 [Agenda] Bid mis à jour pour candidat ${topMatch.name} (score ${topMatch.score}) → FinalBid = ${res.data.profile.companyBid.finalBid}`
            );
          } catch (err) {
            console.error(
              `❌ [Agenda] Échec updateFinalBid pour candidat ${topMatch.name}:`,
              err.response?.data?.message || err.message
            );
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
    // Nettoyage des anciennes planifications pour éviter les doublons
    try {
      const removed = await agendaInstance.cancel({ name: "agent:heartbeat" });
      if (removed > 0) {
        console.log(`🧹 [Agenda] ${removed} ancienne(s) planification(s) supprimée(s) pour agent:heartbeat`);
      }
    } catch (e) {
      console.warn("⚠️  [Agenda] Échec du nettoyage des anciennes planifications:", e?.message);
    }

    await agendaInstance.every(
      "*/1 * * * *",
      "agent:heartbeat",
      {},
      {
        timezone: process.env.TZ || "Europe/Paris",
        skipImmediate: false,
        unique: { name: "agent:heartbeat" },
        insertOnly: true,
      }
    );
    await agendaInstance.now("agent:heartbeat");
    console.log("⏱️ Agenda démarré avec job agent:heartbeat toutes les minutes");

    // Vérification: lister les jobs planifiés
    try {
      const jobs = await agendaInstance.jobs({ name: "agent:heartbeat" });
      if (jobs?.length) {
        const nexts = jobs
          .map((j) => ({
            id: j.attrs._id?.toString(),
            nextRunAt: j.attrs.nextRunAt,
            lastRunAt: j.attrs.lastRunAt,
            lockedAt: j.attrs.lockedAt,
            repeatInterval: j.attrs.repeatInterval,
            timezone: j.attrs.timezone,
          }))
          .sort((a, b) => (a.nextRunAt || 0) - (b.nextRunAt || 0));
        console.log(`🗓️  [Agenda] ${jobs.length} instance(s) planifiées pour agent:heartbeat`);
        nexts.slice(0, 3).forEach((n, idx) => {
          console.log(
            `   • [${idx + 1}] id=${n.id} nextRunAt=${n.nextRunAt} lastRunAt=${n.lastRunAt} lockedAt=${n.lockedAt} repeatInterval=${n.repeatInterval} tz=${n.timezone}`
          );
        });
        // S'il y a des doublons, on ne garde que la première et on supprime les autres
        if (jobs.length > 1) {
          try {
            const toRemoveIds = jobs
              .slice(1)
              .map((j) => j.attrs._id);
            const removedDup = await agendaInstance.cancel({ _id: { $in: toRemoveIds } });
            console.log(`🧽 [Agenda] Doublons nettoyés: ${removedDup} job(s) supprimé(s)`);
          } catch (e) {
            console.warn("⚠️  [Agenda] Échec nettoyage des doublons:", e?.message);
          }
        }
      } else {
        console.warn("⚠️  [Agenda] Aucun job agent:heartbeat planifié trouvé juste après le démarrage");
      }
    } catch (e) {
      console.warn("⚠️  [Agenda] Impossible de lister les jobs planifiés:", e?.message);
    }
  
    // Compteur décroissant
    if (!countdownInterval) {
      countdownInterval = setInterval(() => {
        if (!lastHeartbeatAt) return;
        const nextExpectedAt = lastHeartbeatAt.getTime() + 60000; // +1 minute en ms
        const remainingMs = nextExpectedAt - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  
        if (remainingSeconds % 10 === 0 || remainingSeconds <= 10) { // affichage toutes les 10s + dernières 10 sec
          const minutes = Math.floor(remainingSeconds / 60);
          const seconds = remainingSeconds % 60;
          process.stdout.write(`\r🕒 Prochain heartbeat dans: ${minutes}m ${seconds}s `);
        }
  
        // Watchdog: relance si pas exécuté après 1min + 2s
        if (remainingMs < -2000 && !hasWarnedForCurrentCycle) {
          console.warn("\n⚠️  [Agenda] Aucun heartbeat détecté (>1m2s). Relance...");
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

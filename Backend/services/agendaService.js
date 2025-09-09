const Agenda = require("agenda");
const Agent = require("../models/AgentModel");

let agendaInstance;
let isInitialized = false;
let lastHeartbeatAt = null;
let countdownInterval = null;
let hasWarnedForCurrentCycle = false;

/**
 * Initialize Agenda scheduler and define recurring jobs
 */
async function initializeAgenda() {
  if (isInitialized) {
    return agendaInstance;
  }

  if (!process.env.MONGODB_URI) {
    console.error("❌ Agenda requires MONGODB_URI to be set");
    return null;
  }

  agendaInstance = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
    processEvery: "1 second",
    maxConcurrency: 5,
    defaultConcurrency: 1,
    lockLimit: 10,
  });

  // Define the hourly job
  agendaInstance.define("agent:heartbeat", async () => {
    try {
      // Enregistre l'heure d'exécution du heartbeat
      lastHeartbeatAt = new Date();
      hasWarnedForCurrentCycle = false;
      const agents = await Agent.find({}, { _id: 1, name: 1 })
        .populate({ path: "postId", select: "jobDetails user" })
        .lean();
      if (!agents || agents.length === 0) {
        console.log("[agent:heartbeat] Aucun agent trouvé");
        return;
      }
      agents.forEach((agent) => {
        const agentLabel = agent.name || agent._id?.toString();
        //const username = agent.CampanyId?.username || "unknown-user";
        const jobTitle = agent.postId?.jobDetails?.title || "unknown-title";

        console.log(
          `im here - agent= ${agentLabel} | jobTitle=${jobTitle} `
        );
      });
    } catch (err) {
      console.error("[agent:heartbeat] Error:", err.message);
    }
  });

  agendaInstance.on("ready", async () => {
    // Démarre Agenda avant de planifier les jobs pour plus de fiabilité
    await agendaInstance.start();
    // Planifie le job récurrent toutes les 10 secondes
    await agendaInstance.every("10 seconds", "agent:heartbeat");
    // Info diagnostic: afficher le prochain run prévu
    try {
      const jobs = await agendaInstance.jobs({ name: "agent:heartbeat" });
      const next = jobs?.[0]?.attrs?.nextRunAt;
      if (next) {
        console.log(`Prochain agent:heartbeat prévu à: ${new Date(next).toISOString()}`);
      }
    } catch (e) {
      console.warn("Impossible de lire les jobs agenda:", e?.message);
    }
    // Déclenche une exécution immédiate au démarrage pour visibilité
    await agendaInstance.now("agent:heartbeat");
    console.log(
      "⏱️  Agenda démarré. Job agent:heartbeat planifié toutes les 10 secondes."
    );
/*
    // Démarre un compte à rebours/monitoring pour vérifier l'exécution toutes les 10s
    if (!countdownInterval) {
      countdownInterval = setInterval(async () => {
        if (!lastHeartbeatAt) {
          return;
        }
        const nextExpectedAt = lastHeartbeatAt.getTime() + 10000; // +10s
        const remainingMs = nextExpectedAt - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
        console.log(`Compte à rebours avant prochain heartbeat: ${remainingSeconds}s`);

        // Tolérance de 2s avant d'alerter, et une seule alerte par cycle
        if (remainingMs < -2000 && !hasWarnedForCurrentCycle) {
          console.warn("⚠️  Aucun heartbeat détecté dans la fenêtre attendue (>12s). Vérifiez Agenda.");
          hasWarnedForCurrentCycle = true;
          // Watchdog: tenter de relancer immédiatement le job
          try {
            await agendaInstance.now("agent:heartbeat");
            console.log("Watchdog: relance immédiate de agent:heartbeat");
          } catch (e) {
            console.error("Watchdog: échec de relance du job:", e?.message);
          }
        }
      }, 1000);
    }*/
  });

  agendaInstance.on("error", (err) => {
    console.error("❌ Agenda error:", err);
  });

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await agendaInstance.stop();
      console.log("🛑 Agenda arrêté proprement");
    } catch (e) {
      console.error("Erreur à l'arrêt d'Agenda:", e);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    process.exit(0);
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);

  isInitialized = true;
  return agendaInstance;
}

module.exports = {
  initializeAgenda,
};

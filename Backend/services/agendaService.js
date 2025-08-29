const Agenda = require('agenda');
const Agent = require('../models/AgentModel');

let agendaInstance;
let isInitialized = false;

/**
 * Initialize Agenda scheduler and define recurring jobs
 */
async function initializeAgenda() {
  if (isInitialized) {
    return agendaInstance;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ Agenda requires MONGODB_URI to be set');
    return null;
  }

  agendaInstance = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' },
    processEvery: '30 seconds',
    maxConcurrency: 5,
    defaultConcurrency: 1,
    lockLimit: 10,
  });

  // Define the hourly job
  agendaInstance.define('agent:heartbeat', async () => {
    try {
      const agents = await Agent.find({}, { _id: 1, name: 1 }).lean();
      if (!agents || agents.length === 0) {
        console.log('[agent:heartbeat] Aucun agent trouvé');
        return;
      }
      agents.forEach((agent) => {
        const label = agent.name || agent._id?.toString();
        console.log(`im here - agent=${label}`);
      });
    } catch (err) {
      console.error('[agent:heartbeat] Error:', err.message);
    }
  });

  agendaInstance.on('ready', async () => {
    // Ensure the job runs every hour
    await agendaInstance.every('1 hour', 'agent:heartbeat');
    // Trigger once immediately at startup for visibility
    await agendaInstance.now('agent:heartbeat');
    await agendaInstance.start();
    console.log('⏱️  Agenda démarré. Job agent:heartbeat planifié chaque heure.');
  });

  agendaInstance.on('error', (err) => {
    console.error('❌ Agenda error:', err);
  });

  // Graceful shutdown
  const shutdown = async () => {
    try {
      await agendaInstance.stop();
      console.log('🛑 Agenda arrêté proprement');
    } catch (e) {
      console.error('Erreur à l\'arrêt d\'Agenda:', e);
    }
    process.exit(0);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  isInitialized = true;
  return agendaInstance;
}

module.exports = {
  initializeAgenda,
};



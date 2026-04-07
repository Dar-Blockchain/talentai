const MatchingConfig = require('../../models/MatchingConfig.model');

async function getMatchingConfig(updatedBy, jobId) {
  try {
    let doc = null;
    // 1. Chercher config spécifique au job (et user si fourni)
    if (jobId && updatedBy) {
      doc = await MatchingConfig.findOne({ job: jobId, updatedBy }).lean();
    }

    return doc;
  } catch (err) {
    console.warn('getMatchingConfig error, falling back to defaults', err.message);
    return {
      name: 'default',
      weights: {
        hardSkill: 40,
        experience: 35,
        salary: 10,
        workMode: 7.5,
        contract: 7.5,
      },
      exchangeRates: { USD: 1, EUR: 1.1, TND: 0.32 },
    };
  }
}

module.exports = { getMatchingConfig };

/**
 * Create a new matching configuration and persist it
 * @param {String|ObjectId} userId
 * @param {Object} payload
 */
async function addConfig(userId, payload = {}) {
  const Post = require('../../models/Post.model');

  const toCreate = {
    name: payload.name || 'default',
    weights: payload.weights || defaultConfig().weights,
    exchangeRates: payload.exchangeRates || defaultConfig().exchangeRates,
    updatedBy: userId,
    job : payload.jobId ,
  };

  const created = await MatchingConfig.create(toCreate);

  // Ajouter la relation bidirectionnelle: sauvegarder l'ID de MatchingConfig dans le Post
  if (payload.jobId) {
    await Post.findByIdAndUpdate(
      payload.jobId,
      { MatchingConfig: created._id },
      { new: true }
    );
  }

  return created;
}

/**
 * Update configuration (upsert) and return the new document
 * @param {String|ObjectId} userId
 * @param {Object} payload
 */
async function updateConfig(userId, payload = {}) {
  const update = {};
  if (payload.weights) update.weights = payload.weights;
  if (payload.exchangeRates) update.exchangeRates = payload.exchangeRates;
  update.updatedBy = userId;

  const cfg = await MatchingConfig.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
  // Invalidate cache so next getMatchingConfig picks up changes
  _cache = null;
  _cacheAt = 0;
  return cfg;
}

module.exports = Object.assign(module.exports, { addConfig, updateConfig });

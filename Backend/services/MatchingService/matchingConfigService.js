const MatchingConfig = require('../../models/MatchingConfigModel');

// Simple in-memory cache to avoid hitting DB on every match calculation
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 1000 * 60; // 1 minute

const defaultConfig = () => ({
  name: 'default',
  weights: {
    hardSkill: 40,
    experience: 35,
    salary: 10,
    workMode: 7.5,
    contract: 7.5,
  },
  importanceWeight: { Expert: 1.5, Senior: 1.2, Mid_Level: 1.0, Junior: 0.8 },
  exchangeRates: { USD: 1, EUR: 1.1, TND: 0.32 },
});

async function getMatchingConfig(updatedBy) {
  try {
    const now = Date.now();

    // Use cache only for non-user-specific requests
    if (!updatedBy && _cache && now - _cacheAt < CACHE_TTL_MS) return _cache;

    let doc;
    if (updatedBy) {
      // try to fetch a config created/updated by this user
      doc = await MatchingConfig.findOne({ updatedBy }).lean();
      // fallback to global config if user-specific not found
      if (!doc) doc = await MatchingConfig.findOne({}).lean();
    } else {
      doc = await MatchingConfig.findOne({}).lean();
    }

    if (!doc) {
      // If no config exists yet, persist the default one so admins can edit it later
      try {
        const toCreate = defaultConfig();
        const created = await MatchingConfig.create(toCreate);
        doc = created.toObject ? created.toObject() : created;
        console.log('MatchingConfig: default config created in DB');
      } catch (createErr) {
        console.warn('MatchingConfig: failed to create default config in DB, falling back to defaults', createErr.message);
        if (!updatedBy) {
          _cache = defaultConfig();
          _cacheAt = now;
          return _cache;
        }
        return defaultConfig();
      }
    }

    // Merge defaults with stored values
    const merged = Object.assign({}, defaultConfig(), {
      weights: Object.assign({}, defaultConfig().weights, doc.weights || {}),
      importanceWeight: Object.assign({}, defaultConfig().importanceWeight, doc.importanceWeight || {}),
      exchangeRates: Object.assign({}, defaultConfig().exchangeRates, Object.fromEntries(Object.entries(doc.exchangeRates || {}))),
    });

    if (!updatedBy) {
      _cache = merged;
      _cacheAt = now;
    }

    return merged;
  } catch (err) {
    console.warn('getMatchingConfig error, falling back to defaults', err.message);
    return defaultConfig();
  }
}

module.exports = { getMatchingConfig };

/**
 * Create a new matching configuration and persist it
 * @param {String|ObjectId} userId
 * @param {Object} payload
 */
async function addConfig(userId, payload = {}) {
  const toCreate = {
    name: payload.name || 'default',
    weights: payload.weights || defaultConfig().weights,
    importanceWeight: payload.importanceWeight || defaultConfig().importanceWeight,
    exchangeRates: payload.exchangeRates || defaultConfig().exchangeRates,
    updatedBy: userId
  };

  const created = await MatchingConfig.create(toCreate);
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
  if (payload.importanceWeight) update.importanceWeight = payload.importanceWeight;
  if (payload.exchangeRates) update.exchangeRates = payload.exchangeRates;
  update.updatedBy = userId;

  const cfg = await MatchingConfig.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
  // Invalidate cache so next getMatchingConfig picks up changes
  _cache = null;
  _cacheAt = 0;
  return cfg;
}

module.exports = Object.assign(module.exports, { addConfig, updateConfig });

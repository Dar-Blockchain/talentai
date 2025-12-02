const MatchingConfig = require('../../models/MatchingConfigModel');

// Simple in-memory cache to avoid hitting DB on every match calculation
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL_MS = 1000 * 60; // 1 minute

const defaultConfig = () => ({
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

async function getMatchingConfig() {
  try {
    const now = Date.now();
    if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;

    let doc = await MatchingConfig.findOne({}).lean();
    if (!doc) {
      // If no config exists yet, persist the default one so admins can edit it later
      try {
        const toCreate = defaultConfig();
        // Create and retrieve the stored document
        const created = await MatchingConfig.create(toCreate);
        // Ensure we work with a plain object
        doc = created.toObject ? created.toObject() : created;
        console.log('MatchingConfig: default config created in DB');
      } catch (createErr) {
        console.warn('MatchingConfig: failed to create default config in DB, falling back to defaults', createErr.message);
        _cache = defaultConfig();
        _cacheAt = now;
        return _cache;
      }
    }

    // Merge defaults with stored values
    const merged = Object.assign({}, defaultConfig(), {
      weights: Object.assign({}, defaultConfig().weights, doc.weights || {}),
      importanceWeight: Object.assign({}, defaultConfig().importanceWeight, doc.importanceWeight || {}),
      exchangeRates: Object.assign({}, defaultConfig().exchangeRates, Object.fromEntries(Object.entries(doc.exchangeRates || {}))),
    });

    _cache = merged;
    _cacheAt = now;
    return _cache;
  } catch (err) {
    console.warn('getMatchingConfig error, falling back to defaults', err.message);
    return defaultConfig();
  }
}

module.exports = { getMatchingConfig };

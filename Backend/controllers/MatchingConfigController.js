const MatchingConfig = require('../models/MatchingConfigModel');

// GET /api/matching-config
async function getConfig(req, res) {
  try {
    let cfg = await MatchingConfig.findOne({}).lean();
    if (!cfg) {
      // If no config in DB, create one with schema defaults so it can be edited later
      try {
        const created = await MatchingConfig.create({});
        cfg = created.toObject ? created.toObject() : created;
        console.log('MatchingConfig: default configuration created in DB');
      } catch (createErr) {
        console.warn('MatchingConfig: failed to persist default config, returning defaults only', createErr.message);
        // Return defaults from model schema by creating a temporary instance
        cfg = new MatchingConfig();
        cfg = cfg.toObject();
      }
    }

    return res.json({ success: true, config: cfg });
  } catch (err) {
    console.error('Error fetching matching config:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/matching-config
async function updateConfig(req, res) {
  try {
    const payload = req.body || {};
    const update = {};
    if (payload.weights) update.weights = payload.weights;
    if (payload.importanceWeight) update.importanceWeight = payload.importanceWeight;
    if (payload.exchangeRates) update.exchangeRates = payload.exchangeRates;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided' });
    }

    const cfg = await MatchingConfig.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
    return res.json({ success: true, config: cfg });
  } catch (err) {
    console.error('Error updating matching config:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getConfig, updateConfig };

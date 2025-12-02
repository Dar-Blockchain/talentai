const MatchingConfig = require('../../models/MatchingConfigModel');

// POST /api/matching-config/add - Add new configuration
async function addConfig(req, res) {
  try {
    console.log(`📝 [addConfig] Attempting to add new matching configuration by user: ${req.user._id}`);
    
    const { name } = req.body || {};
    
    // Use provided config or defaults
    const newConfig = {
      name: name ,
      weights: req.body?.weights ,
      importanceWeight: req.body?.importanceWeight ,
      exchangeRates: req.body?.exchangeRates,
      updatedBy: req.user._id
    };
    
    console.log(`✏️ [addConfig] Configuration template: weights=${JSON.stringify(newConfig.weights)}, updatedBy=${req.user._id}`);
    
    const cfg = await MatchingConfig.create(newConfig);
    
    console.log(`✅ [addConfig] Configuration successfully created with ID: ${cfg._id}, by user: ${req.user._id}`);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Configuration added successfully',
      config: cfg 
    });
  } catch (err) {
    console.error(`❌ [addConfig] Error adding matching config for user: ${req.user._id}, error:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

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
    console.log(`📝 [updateConfig] Attempting to update matching configuration by user: ${req.user._id}`);
    
    const payload = req.body || {};
    const update = {};
    
    if (payload.weights) update.weights = payload.weights;
    if (payload.importanceWeight) update.importanceWeight = payload.importanceWeight;
    if (payload.exchangeRates) update.exchangeRates = payload.exchangeRates;
    
    // Add updatedBy with current user ID
    update.updatedBy = req.user._id;
    
    if (Object.keys(update).length === 1 && update.updatedBy) {
      console.warn(`⚠️ [updateConfig] No valid configuration fields provided by user: ${req.user._id}`);
      return res.status(400).json({ success: false, error: 'No valid fields provided' });
    }

    console.log(`✏️ [updateConfig] Updating config fields: ${Object.keys(update).join(', ')}, by user: ${req.user._id}`);
    
    const cfg = await MatchingConfig.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
    
    console.log(`✅ [updateConfig] Configuration updated successfully by user: ${req.user._id}`);
    
    return res.json({ success: true, config: cfg });
  } catch (err) {
    console.error(`❌ [updateConfig] Error updating matching config for user: ${req.user._id}, error:`, err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getConfig, updateConfig, addConfig };

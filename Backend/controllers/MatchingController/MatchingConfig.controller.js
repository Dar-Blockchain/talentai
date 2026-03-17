const matchingConfigService = require("../../services/MatchingService/matchingConfig.service");

// POST /api/matching-config/add - Add new configuration (delegates to service)
async function addConfig(req, res) {
  try {
    const userId = req.user && req.user._id;
    console.log(
      `📝 [addConfig] Attempting to add new matching configuration by user: ${userId}`,
    );

    const payload = req.body || {};
    const cfg = await matchingConfigService.addConfig(userId, payload);

    console.log(
      `✅ [addConfig] Configuration successfully created with ID: ${cfg._id}, by user: ${userId}`,
    );

    return res.status(201).json({
      success: true,
      message: "Configuration added successfully",
      config: cfg,
    });
  } catch (err) {
    console.error(
      `❌ [addConfig] Error adding matching config for user: ${req.user && req.user._id}, error:`,
      err.message,
    );
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/matching-config
async function getConfig(req, res) {
  try {
    const userId = req.user && req.user._id;
    const jobId = req.body.jobId;
    console.log(
      `🔍 [getConfig] Fetching matching configuration for user: ${userId}`,
    );
    const cfg = await matchingConfigService.getMatchingConfig(userId, jobId);
    return res.json({ success: true, config: cfg });
  } catch (err) {
    console.error("Error fetching matching config:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// PUT /api/matching-config
async function updateConfig(req, res) {
  try {
    const userId = req.user && req.user._id;
    console.log(
      `📝 [updateConfig] Attempting to update matching configuration by user: ${userId}`,
    );

    const payload = req.body || {};

    // Delegate update to service
    const cfg = await matchingConfigService.updateConfig(userId, payload);

    if (!cfg) {
      return res
        .status(400)
        .json({ success: false, error: "No valid fields provided" });
    }

    console.log(
      `✅ [updateConfig] Configuration updated successfully by user: ${userId}`,
    );
    return res.json({ success: true, config: cfg });
  } catch (err) {
    console.error(
      `❌ [updateConfig] Error updating matching config for user: ${req.user && req.user._id}, error:`,
      err.message,
    );
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getConfig, updateConfig, addConfig };

const ApiKeyService = require("./api-key.service");

module.exports.createApiKey = async (req, res) => {
  try {
    const result = await ApiKeyService.createApiKey(req.user._id, req.body);
    res.status(201).json({ success: true, message: "API key created successfully", data: result });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports.listApiKeys = async (req, res) => {
  try {
    const result = await ApiKeyService.listApiKeys(req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error retrieving API keys:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports.getApiKeyDetails = async (req, res) => {
  try {
    const result = await ApiKeyService.getApiKeyDetails(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error retrieving API key:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports.updateApiKey = async (req, res) => {
  try {
    const result = await ApiKeyService.updateApiKey(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, message: "API key updated successfully", data: result });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports.toggleApiKey = async (req, res) => {
  try {
    const result = await ApiKeyService.toggleApiKey(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: result.message, data: { id: result.id, isActive: result.isActive } });
  } catch (error) {
    console.error("Error toggling API key:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports.regenerateApiKey = async (req, res) => {
  try {
    const result = await ApiKeyService.regenerateApiKey(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id, name: result.name, key: result.key, createdAt: result.createdAt },
    });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports.deleteApiKey = async (req, res) => {
  try {
    const result = await ApiKeyService.deleteApiKey(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

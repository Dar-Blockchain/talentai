const ApiKeyService = require("../services/ApiKey.service");

/**
 * Create a new API key
 * POST /api/api-keys
 * Body: { name, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist? }
 */
const createApiKey = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await ApiKeyService.createApiKey(userId, req.body);

    res.status(201).json({
      success: true,
      message: "API key created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * List all API keys for the user
 * GET /api/api-keys
 */
const listApiKeys = async (req, res) => {
  try {
    const userId = req.user._id
    const result = await ApiKeyService.listApiKeys(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving API keys:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get details of a specific API key
 * GET /api/api-keys/:id
 */
const getApiKeyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await ApiKeyService.getApiKeyDetails(id, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving API key:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update an API key
 * PUT /api/api-keys/:id
 * Body: { name?, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist?, isActive? }
 */
const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await ApiKeyService.updateApiKey(id, userId, req.body);

    res.status(200).json({
      success: true,
      message: "API key updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Disable/re-enable an API key
 * PATCH /api/api-keys/:id/toggle
 */
const toggleApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await ApiKeyService.toggleApiKey(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { id: result.id, isActive: result.isActive },
    });
  } catch (error) {
    console.error("Error toggling API key:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Regenerate an API key (create a new one)
 * POST /api/api-keys/:id/regenerate
 */
const regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await ApiKeyService.regenerateApiKey(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
        name: result.name,
        key: result.key,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete an API key
 * DELETE /api/api-keys/:id
 */
const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const result = await ApiKeyService.deleteApiKey(id, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createApiKey,
  listApiKeys,
  getApiKeyDetails,
  updateApiKey,
  toggleApiKey,
  regenerateApiKey,
  deleteApiKey,
};

const ApiKey = require("../models/ApiKey.model");
const User = require("../models/User.model");

/**
 * Create a new API key
 * POST /api/api-keys
 * Body: { name, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist? }
 */
const createApiKey = async (req, res) => {
  try {
    const { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist } =
      req.body;
    const userId = req.user._id;

    // Validation
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    // Generate a new key only
    const plainKey = ApiKey.generateKey();
    const keyHash = ApiKey.hashKey(plainKey);

    const newApiKey = new ApiKey({
      key: plainKey,
      keyHash,
      name,
      userId,
      serviceName: serviceName || "custom-service",
      scopes: scopes || ["read:posts", "write:posts"],
      rateLimit: rateLimit || 1000,
      expiresAt,
      ipWhitelist: ipWhitelist || [],
    });

    await newApiKey.save();

    // Retourner la clé (complète) une seule fois à la création
    res.status(201).json({
      success: true,
      message: "API key created successfully",
      data: {
        id: newApiKey._id,
        name: newApiKey.name,
        serviceName: newApiKey.serviceName,
        key: plainKey, // Show the key only once
        scopes: newApiKey.scopes,
        rateLimit: newApiKey.rateLimit,
        isActive: newApiKey.isActive,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error creating API key",
      error: error.message,
    });
  }
};

/**
 * List all API keys for the user
 * GET /api/api-keys
 */
const listApiKeys = async (req, res) => {
  try {
    const userId = req.userId;

    const apiKeys = await ApiKey.find({ userId });

    res.status(200).json({
      success: true,
      data: apiKeys.map((key) => ({
        id: key._id,
        name: key.name,
        serviceName: key.serviceName,
        keyPreview: `${key.keyHash.substring(0, 7)}...${key.keyHash.substring(
          key.keyHash.length - 7
        )}`, // Show only first 7 and last 7 characters
        scopes: key.scopes,
        rateLimit: key.rateLimit,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error retrieving API keys:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving API keys",
      error: error.message,
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

    const apiKey = await ApiKey.findOne({ _id: id, userId }).select(
      "-key -keyHash"
    );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    res.status(200).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error("Error retrieving API key:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving API key",
      error: error.message,
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
    const { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist, isActive } =
      req.body;

    let apiKey = await ApiKey.findOne({ _id: id, userId });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    // Update fields
    if (name) apiKey.name = name;
    if (serviceName) apiKey.serviceName = serviceName;
    if (scopes) apiKey.scopes = scopes;
    if (rateLimit) apiKey.rateLimit = rateLimit;
    if (expiresAt) apiKey.expiresAt = expiresAt;
    if (ipWhitelist) apiKey.ipWhitelist = ipWhitelist;
    if (isActive !== undefined) apiKey.isActive = isActive;

    await apiKey.save();

    res.status(200).json({
      success: true,
      message: "API key updated successfully",
      data: apiKey,
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({
      success: false,
      message: "Error updating API key",
      error: error.message,
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

    const apiKey = await ApiKey.findOne({ _id: id, userId });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    res.status(200).json({
      success: true,
      message: `API key ${apiKey.isActive ? "enabled" : "disabled"}`,
      data: { id: apiKey._id, isActive: apiKey.isActive },
    });
  } catch (error) {
    console.error("Error toggling API key:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling API key",
      error: error.message,
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

    const apiKey = await ApiKey.findOne({ _id: id, userId });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    // Generate a new key
    const newPlainKey = ApiKey.generateKey();
    const newKeyHash = ApiKey.hashKey(newPlainKey);

    apiKey.key = newPlainKey;
    apiKey.keyHash = newKeyHash;
    apiKey.lastUsed = null; // Reset last usage
    await apiKey.save();

    res.status(200).json({
      success: true,
      message: "API key regenerated successfully",
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: newPlainKey, // Display new key
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving API key:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving API key",
      error: error.message,
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

    const apiKey = await ApiKey.findOneAndDelete({ _id: id, userId });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: "API key not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API key deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({
      success: false,
      message: "Error creating API key",
      error: error.message,
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

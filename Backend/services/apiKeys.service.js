const ApiKey = require("../models/ApiKeys.model");

/**
 * ApiKey Service - Business logic for API key management
 */

/**
 * Create a new API key
 * @param {string} userId - User ID
 * @param {Object} keyData - API key data { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist }
 * @returns {Object} Created API key with plain key (only returned once)
 */
module.exports.createApiKey = async (userId, keyData) => {
  try {
    const { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist } =
      keyData;

    // Validation
    if (!name || typeof name !== "string") {
      const err = new Error("Name is required");
      err.status = 400;
      throw err;
    }

    // Generate a new key
    const plainKey = ApiKey.generateKey();
    const keyHash = ApiKey.hashKey(plainKey);

    const newApiKey = new ApiKey({
      key: plainKey,
      keyHash,
      name: name.trim(),
      userId,
      serviceName: serviceName || "custom-service",
      scopes: scopes || ["read:posts", "write:posts"],
      rateLimit: rateLimit || 1000,
      expiresAt,
      ipWhitelist: ipWhitelist || [],
    });

    await newApiKey.save();

    // Return the complete key only once at creation
    return {
      id: newApiKey._id,
      name: newApiKey.name,
      serviceName: newApiKey.serviceName,
      key: plainKey, // Show the key only once
      scopes: newApiKey.scopes,
      rateLimit: newApiKey.rateLimit,
      isActive: newApiKey.isActive,
      expiresAt: newApiKey.expiresAt,
      createdAt: newApiKey.createdAt,
    };
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error creating API key";
    }
    throw error;
  }
};

/**
 * List all API keys for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of API keys with masked key hashes
 */
module.exports.listApiKeys = async (userId) => {
  try {
    const apiKeys = await ApiKey.find({ userId }).lean();

    return apiKeys.map((key) => ({
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
    }));
  } catch (error) {
    const err = new Error("Error retrieving API keys");
    err.status = 500;
    throw err;
  }
};

/**
 * Get details of a specific API key
 * @param {string} keyId - API Key ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Object} API key details without sensitive data
 */
module.exports.getApiKeyDetails = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOne({ _id: keyId, userId }).select(
      "-key -keyHash"
    ).lean();

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    return apiKey;
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error retrieving API key";
    }
    throw error;
  }
};

/**
 * Update an API key
 * @param {string} keyId - API Key ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Fields to update
 * @returns {Object} Updated API key
 */
module.exports.updateApiKey = async (keyId, userId, updateData) => {
  try {
    const { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist, isActive } =
      updateData;

    let apiKey = await ApiKey.findOne({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    // Update fields
    if (name) apiKey.name = name.trim();
    if (serviceName) apiKey.serviceName = serviceName;
    if (scopes) apiKey.scopes = scopes;
    if (rateLimit) apiKey.rateLimit = rateLimit;
    if (expiresAt !== undefined) apiKey.expiresAt = expiresAt;
    if (ipWhitelist) apiKey.ipWhitelist = ipWhitelist;
    if (isActive !== undefined) apiKey.isActive = isActive;

    await apiKey.save();

    return apiKey;
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error updating API key";
    }
    throw error;
  }
};

/**
 * Toggle API key active/inactive status
 * @param {string} keyId - API Key ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Object} Updated API key with new active status
 */
module.exports.toggleApiKey = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOne({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    return {
      id: apiKey._id,
      isActive: apiKey.isActive,
      message: `API key ${apiKey.isActive ? "enabled" : "disabled"}`,
    };
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error toggling API key";
    }
    throw error;
  }
};

/**
 * Regenerate an API key with a new key value
 * @param {string} keyId - API Key ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Object} Regenerated API key with new plain key
 */
module.exports.regenerateApiKey = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOne({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    // Generate a new key
    const newPlainKey = ApiKey.generateKey();
    const newKeyHash = ApiKey.hashKey(newPlainKey);

    apiKey.key = newPlainKey;
    apiKey.keyHash = newKeyHash;
    apiKey.lastUsed = null; // Reset last usage
    await apiKey.save();

    return {
      id: apiKey._id,
      name: apiKey.name,
      key: newPlainKey, // Display new key
      createdAt: apiKey.createdAt,
      message: "API key regenerated successfully",
    };
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error regenerating API key";
    }
    throw error;
  }
};

/**
 * Delete an API key
 * @param {string} keyId - API Key ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Object} Deletion confirmation
 */
module.exports.deleteApiKey = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    return {
      message: "API key deleted successfully",
    };
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error deleting API key";
    }
    throw error;
  }
};

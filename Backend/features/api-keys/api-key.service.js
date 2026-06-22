const ApiKey = require("./api-key.model");

module.exports.createApiKey = async (userId, keyData) => {
  try {
    const { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist } = keyData;

    if (!name || typeof name !== "string") {
      const err = new Error("Name is required");
      err.status = 400;
      throw err;
    }

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

    return {
      id: newApiKey._id,
      name: newApiKey.name,
      serviceName: newApiKey.serviceName,
      key: plainKey,
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

module.exports.listApiKeys = async (userId) => {
  try {
    const apiKeys = await ApiKey.find({ userId }).lean();

    return apiKeys.map((key) => ({
      id: key._id,
      name: key.name,
      serviceName: key.serviceName,
      keyPreview: `${key.keyHash.substring(0, 7)}...${key.keyHash.substring(key.keyHash.length - 7)}`,
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

module.exports.getApiKeyDetails = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOne({ _id: keyId, userId }).select("-key -keyHash").lean();

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

module.exports.updateApiKey = async (keyId, userId, updateData) => {
  try {
    const { name, serviceName, scopes, rateLimit, expiresAt, ipWhitelist, isActive } = updateData;

    let apiKey = await ApiKey.findOne({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

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

module.exports.regenerateApiKey = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOne({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    const newPlainKey = ApiKey.generateKey();
    const newKeyHash = ApiKey.hashKey(newPlainKey);

    apiKey.key = newPlainKey;
    apiKey.keyHash = newKeyHash;
    apiKey.lastUsed = null;
    await apiKey.save();

    return {
      id: apiKey._id,
      name: apiKey.name,
      key: newPlainKey,
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

module.exports.deleteApiKey = async (keyId, userId) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({ _id: keyId, userId });

    if (!apiKey) {
      const err = new Error("API key not found");
      err.status = 404;
      throw err;
    }

    return { message: "API key deleted successfully" };
  } catch (error) {
    if (!error.status) {
      error.status = 500;
      error.message = "Error deleting API key";
    }
    throw error;
  }
};

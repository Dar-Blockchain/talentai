const ApiKey = require("../models/ApiKey.model");
const User = require("../models/User.model");

/**
 * Créer une nouvelle clé API
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
        .json({ success: false, message: "Le nom est requis" });
    }

    // Générer une nouvelle clé uniquement
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
      message: "Clé API créée avec succès",
      data: {
        id: newApiKey._id,
        name: newApiKey.name,
        serviceName: newApiKey.serviceName,
        key: plainKey, // Afficher la clé une seule fois
        scopes: newApiKey.scopes,
        rateLimit: newApiKey.rateLimit,
        isActive: newApiKey.isActive,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la clé API",
      error: error.message,
    });
  }
};

/**
 * Lister toutes les clés API de l'utilisateur
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
        )}`, // Afficher seulement les 7 premiers et derniers caractères
        scopes: key.scopes,
        rateLimit: key.rateLimit,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des clés API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des clés API",
      error: error.message,
    });
  }
};

/**
 * Obtenir les détails d'une clé API spécifique
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
        message: "Clé API non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la clé API",
      error: error.message,
    });
  }
};

/**
 * Mettre à jour une clé API
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
        message: "Clé API non trouvée",
      });
    }

    // Mettre à jour les champs
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
      message: "Clé API mise à jour avec succès",
      data: apiKey,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la clé API",
      error: error.message,
    });
  }
};

/**
 * Désactiver/réactiver une clé API
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
        message: "Clé API non trouvée",
      });
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    res.status(200).json({
      success: true,
      message: `Clé API ${apiKey.isActive ? "activée" : "désactivée"}`,
      data: { id: apiKey._id, isActive: apiKey.isActive },
    });
  } catch (error) {
    console.error("Erreur lors du basculement de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du basculement de la clé API",
      error: error.message,
    });
  }
};

/**
 * Régénérer une clé API (créer une nouvelle)
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
        message: "Clé API non trouvée",
      });
    }

    // Générer une nouvelle clé
    const newPlainKey = ApiKey.generateKey();
    const newKeyHash = ApiKey.hashKey(newPlainKey);

    apiKey.key = newPlainKey;
    apiKey.keyHash = newKeyHash;
    apiKey.lastUsed = null; // Réinitialiser la dernière utilisation
    await apiKey.save();

    res.status(200).json({
      success: true,
      message: "Clé API régénérée avec succès",
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: newPlainKey, // Afficher la nouvelle clé
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la régénération de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la régénération de la clé API",
      error: error.message,
    });
  }
};

/**
 * Supprimer une clé API
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
        message: "Clé API non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      message: "Clé API supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la clé API",
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

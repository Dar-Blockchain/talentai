const ApiKey = require("../../models/ApiKey.model");

/**
 * Middleware pour vérifier la clé API
 * Utilisation:
 * - En header: Authorization: Bearer sk_xxxxx
 * - En query: ?apiKey=sk_xxxxx
 * - En header custom: X-API-Key: sk_xxxxx
 */
const verifyApiKey = async (req, res, next) => {
  try {
    let apiKey = null;

    // Vérifier les différentes sources de clé API
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        apiKey = parts[1];
      }
    } else if (req.headers["x-api-key"]) {
      apiKey = req.headers["x-api-key"];
    } else if (req.query.apiKey) {
      apiKey = req.query.apiKey;
    }

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key manquante. Utilisez: Authorization: Bearer sk_xxxxx ou X-API-Key: sk_xxxxx",
      });
    }

    // Vérifier si la clé existe
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey });

    if (!apiKeyDoc) {
      return res.status(401).json({
        success: false,
        message: "Clé API invalide",
      });
    }

    // Vérifier si la clé est active
    if (!apiKeyDoc.isActive) {
      return res.status(401).json({
        success: false,
        message: "Clé API désactivée",
      });
    }

    // Vérifier l'expiration
    if (apiKeyDoc.expiresAt && new Date() > apiKeyDoc.expiresAt) {
      return res.status(401).json({
        success: false,
        message: "Clé API expirée",
      });
    }

    // Vérifier la whitelist IP (optionnel)
    if (apiKeyDoc.ipWhitelist && apiKeyDoc.ipWhitelist.length > 0) {
      const clientIp = req.ip || req.connection.remoteAddress;
      if (!apiKeyDoc.ipWhitelist.includes(clientIp)) {
        return res.status(403).json({
          success: false,
          message: "IP non autorisée",
        });
      }
    }

    // Ajouter la clé et l'utilisateur au contexte de la requête
    req.apiKey = apiKeyDoc;
    req.userId = apiKeyDoc.userId.toString();
    req.isApiKeyAuth = true;

    // Mettre à jour le lastUsed
    apiKeyDoc.lastUsed = new Date();
    await apiKeyDoc.save();

    next();
  } catch (error) {
    console.error("Erreur lors de la vérification de la clé API:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification de la clé API",
      error: error.message,
    });
  }
};

/**
 * Middleware pour vérifier les scopes/permissions
 * Utilisation: checkScope(['read:posts', 'write:posts'])
 */
const checkScope = (requiredScopes) => {
  return (req, res, next) => {
    if (!req.isApiKeyAuth) {
      return next(); // Laisser les autres middlewares d'auth gérer
    }

    const apiKey = req.apiKey;

    // Vérifier si toutes les scopes requises sont présentes
    const hasAllScopes = requiredScopes.every((scope) =>
      apiKey.scopes.includes(scope)
    );

    if (!hasAllScopes) {
      return res.status(403).json({
        success: false,
        message: "Permissions insuffisantes",
        requiredScopes,
        availableScopes: apiKey.scopes,
      });
    }

    next();
  };
};

module.exports = {
  verifyApiKey,
  checkScope,
};

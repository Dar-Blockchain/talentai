const jwt = require("jsonwebtoken");
const userModel = require("../models/User.model");

const requireAuthUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.Net_Secret);

    // USER principal
    const user = await userModel
      .findById(decodedToken.id)
      .populate("profile")
      .populate("companyMembership");

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Attach decoded token and raw token to user context so tools/controllers can reuse it
    user.authToken = token;
    user.authDecoded = decodedToken;
    req.user = user; // ✅ TOUJOURS l’utilisateur

    // CONTEXTE COMPANY (optionnel)
    if (decodedToken.companyId) {
      const company = await userModel
        .findById(decodedToken.companyId)
        .populate("profile");

      if (!company) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      req.company = company; // ✅ séparé
    }

    req.auth = {
      userId: decodedToken.id,
      companyId: decodedToken.companyId || null,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


module.exports = { requireAuthUser };

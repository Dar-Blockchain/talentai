const resolveCompanyActor = (req, res, next) => {
  console.log("🔍 resolveCompanyActor - Checking actor...");
  console.log("   - req.company:", req.company ? `${req.company._id}` : "undefined");
  console.log("   - req.user:", req.user ? `${req.user._id}` : "undefined");

  // Garder l'ID réel de l'utilisateur avant de remplacer req.user
  if (req.user && req.user._id) {
    req.actualUser = req.user;
  }

  // Si une company existe, elle devient l'acteur principal
  if (req.company && req.company._id) {
    console.log("✅ Using company as actor:", req.company._id);
    req.user = req.company; // overwrite volontaire
  }

  // Sécurité minimale
  if (!req.user || !req.user._id) {
    console.log("❌ No actor found - Unauthorized");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: no actor found",
    });
  }

  console.log("✅ Actor resolved:", req.user._id);
  next();
};

module.exports = resolveCompanyActor;

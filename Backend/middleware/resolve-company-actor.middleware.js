const resolveCompanyActor = (req, res, next) => {
  // Si une company existe, elle devient l'acteur principal
  if (req.company && req.company._id) {
    console.log("✅ Using company as actor:", req.company._id);
    req.user = req.company; // overwrite volontaire
  }

  // Minimal security
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

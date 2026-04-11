const resolveCompanyActor = (req, res, next) => {
  // Si une company existe, elle devient l'acteur principal
  if (req.company && req.company._id) {
    req.user = req.company; // overwrite volontaire
  }

  // Minimal security
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: no actor found",
    });
  }

  next();
};

module.exports = resolveCompanyActor;

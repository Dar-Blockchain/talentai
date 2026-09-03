const skillService = require("./skill.service");

const handleError = (res, error) => {
  res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
};

/**
 * GET /skills
 * Returns the authenticated user's skills with pagination and filters.
 */
module.exports.getMySkills = async (req, res) => {
  try {
    const profileId = await skillService.resolveProfileId(req.user._id);
    const { kind, search, verified, level, page, limit, sortBy, sortOrder } = req.query;

    const result = await skillService.getSkillsByProfile(profileId, {
      kind,
      search,
      verified: verified === "true",
      level,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error);
  }
};

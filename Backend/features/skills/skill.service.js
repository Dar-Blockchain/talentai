const ProfileSkill = require("./profile-skill.model");
const Profile      = require("../users/profile.model");

/**
 * Get paginated skills for a profile.
 *
 * @param {ObjectId|string} profileId
 * @param {object} opts
 * @param {'technical'|'soft'|'all'} opts.kind   - filter by skill type (default: 'all')
 * @param {string}  opts.search  - case-insensitive name search
 * @param {boolean} opts.verified - when true, return only skills with levelConfirmed > 0
 * @param {number}  opts.page    - 0-based page index (default: 0)
 * @param {number}  opts.limit   - max items per page (default: 20, max: 100)
 * @param {'name'|'levelConfirmed'|'testScore'|'createdAt'} opts.sortBy
 * @param {'asc'|'desc'} opts.sortOrder
 */
module.exports.getSkillsByProfile = async (profileId, opts = {}) => {
  const {
    kind       = "all",
    search     = "",
    verified   = false,
    page       = 0,
    limit      = 20,
    sortBy     = "name",
    sortOrder  = "asc",
  } = opts;

  const safePage  = Math.max(0, parseInt(page)  || 0);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip      = safePage * safeLimit;

  const filter = { profile: profileId };

  if (kind === "technical" || kind === "soft") filter.kind = kind;
  if (search)   filter.name = { $regex: search, $options: "i" };
  if (verified) filter.levelConfirmed = { $gt: 0 };

  const allowedSortFields = ["name", "levelConfirmed", "testScore", "proficiencyLevel", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";
  const sortDir   = sortOrder === "desc" ? -1 : 1;

  const [skills, total] = await Promise.all([
    ProfileSkill.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    ProfileSkill.countDocuments(filter),
  ]);

  return {
    skills,
    pagination: {
      page:       safePage,
      limit:      safeLimit,
      total,
      pages:      Math.ceil(total / safeLimit),
      hasNext:    safePage < Math.ceil(total / safeLimit) - 1,
      hasPrev:    safePage > 0,
    },
  };
};

/**
 * Resolve a userId to its profile _id.
 */
module.exports.resolveProfileId = async (userId) => {
  const profile = await Profile.findOne({ userId }).select("_id").lean();
  if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });
  return profile._id;
};

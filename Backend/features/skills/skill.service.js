const ProfileSkill = require("./profile-skill.model");
const Profile      = require("../users/profile.model");

// testScore band per level key, matching the frontend's getLevelKey
// (src/modules/candidate/skills/utils/level.ts). Upper bound is exclusive.
const LEVEL_SCORE_RANGES = {
  1: [0, 20],    // entry
  2: [20, 40],   // junior
  3: [40, 60],   // mid
  4: [60, 80],   // senior
  5: [80, 1e9],  // expert
};

/**
 * Get paginated skills for a profile.
 *
 * @param {ObjectId|string} profileId
 * @param {object} opts
 * @param {'technical'|'soft'|'all'} opts.kind   - filter by skill type (default: 'all')
 * @param {string}  opts.search  - case-insensitive name search
 * @param {boolean} opts.verified - when true, return only skills with levelConfirmed > 0
 * @param {number}  opts.level   - 1-5 (entry..expert); returns only tested skills whose testScore falls in that band
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
    level      = null,
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

  const levelRange = LEVEL_SCORE_RANGES[parseInt(level, 10)];
  if (levelRange) {
    filter.numberTestPassed = { $gt: 0 };            // only actually-tested skills have a level
    filter.testScore        = { $gte: levelRange[0], $lt: levelRange[1] };
  }

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

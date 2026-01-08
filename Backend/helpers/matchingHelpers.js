const { normalizeSkillName } = require("../services/MatchingService/matchingService");

/**
 * Prepare skills by normalizing their names
 * @param {Array} skills - Array of skills to prepare
 * @returns {Array} Prepared skills with normalized names
 */
const prepareSkills = (skills) =>
  (skills || [])
    .filter((s) => s?.name)
    .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

module.exports = {
  prepareSkills,
};

const { normalizeSkillName } = require("../services/MatchingService/matchingService");

/**
 * Prépare les skills en normalisant leurs noms
 * @param {Array} skills - Tableau des skills à préparer
 * @returns {Array} Skills préparés avec noms normalisés
 */
const prepareSkills = (skills) =>
  (skills || [])
    .filter((s) => s?.name)
    .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

module.exports = {
  prepareSkills,
};

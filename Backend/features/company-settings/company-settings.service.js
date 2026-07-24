const CompanySettings = require("./company-settings.model");

// Schema defaults, keyed by field — used to backfill rows saved before a field
// existed. Mongoose only applies `default:` on document creation, so a .lean()
// read of an older row is just missing the key rather than getting the default.
const SCHEMA_DEFAULTS = Object.fromEntries(
  Object.entries(CompanySettings.schema.paths)
    .filter(([, path]) => path.defaultValue !== undefined)
    .map(([key, path]) => [key, typeof path.defaultValue === "function" ? path.defaultValue() : path.defaultValue])
);

// Returns the company's settings, creating a row with defaults on first access.
module.exports.getOrCreateSettings = async (companyId) => {
  let settings = await CompanySettings.findOne({ companyId }).lean();
  if (!settings) {
    const created = await CompanySettings.create({ companyId });
    settings = created.toObject();
  }
  return { ...SCHEMA_DEFAULTS, ...settings };
};

// aiCostPerInterview (TalentAI's own per-interview charge) and blendedHourlyRate
// are intentionally excluded — they're fixed on our side, not something a
// company should be able to change from their settings.
const EDITABLE_FIELDS = ["manualCostPerCandidate", "interviewDurationMinutes"];
module.exports.EDITABLE_FIELDS = EDITABLE_FIELDS;

// Patches only the whitelisted cost-comparison fields; creates the row on first write.
module.exports.updateSettings = async (companyId, updates) => {
  const patch = {};
  for (const key of EDITABLE_FIELDS) {
    if (updates[key] !== undefined) patch[key] = updates[key];
  }
  const settings = await CompanySettings.findOneAndUpdate(
    { companyId },
    { $set: patch },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return { ...SCHEMA_DEFAULTS, ...settings };
};

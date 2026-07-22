const CompanySettingsService = require("./company-settings.service");

const handleError = (res, error, defaultStatus = 500) => {
  console.error("CompanySettings error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({ success: false, error: error?.message || "Internal server error" });
};

// aiCostPerInterview and blendedHourlyRate are fixed on our side and deliberately
// not accepted here — see CompanySettingsService.EDITABLE_FIELDS.
const NUMERIC_FIELDS = ["manualCostPerCandidate", "interviewDurationMinutes"];

module.exports.getSettings = async (req, res) => {
  try {
    const companyId = req.user._id;
    const data = await CompanySettingsService.getOrCreateSettings(companyId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.updateSettings = async (req, res) => {
  try {
    if (req.user.role !== "Company") {
      return res.status(403).json({ success: false, error: "Only company accounts can edit these settings." });
    }

    const updates = {};
    for (const field of NUMERIC_FIELDS) {
      if (req.body[field] === undefined) continue;
      const value = Number(req.body[field]);
      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ success: false, error: `${field} must be a non-negative number.` });
      }
      updates[field] = value;
    }

    const companyId = req.user._id;
    const data = await CompanySettingsService.updateSettings(companyId, updates);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

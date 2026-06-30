const profileService = require("./profile.service");
const CVAnalysisService = require("../cv-analysis/cv-analysis.service");
const jobApplicationService = require("../job-applications/job-application.service");

module.exports.getMyProfile = async (req, res) => {
  try {
    const { user, profile, planLimits, companyMembership } =
      await profileService.getProfileByUserId(req.user._id);
    res
      .status(200)
      .json({
        success: true,
        message: "Profile retrieved successfully",
        user,
        profile,
        planLimits,
        companyMembership,
      });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        success: false,
        message: error.message || "Internal error retrieving profile",
      });
  }
};

module.exports.getProfileById = async (req, res) => {
  try {
    const { user, profile, companyMembership } =
      await profileService.getProfileByUserId(req.params.userId);
    res
      .status(200)
      .json({
        success: true,
        message: "Profile retrieved successfully",
        user,
        profile,
        companyMembership,
      });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        success: false,
        message: error.message || "Error retrieving profile",
      });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profileData = req.body;
    const file = req.file;

    if (!file && !Object.values(profileData).some(Boolean)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one field must be provided for update",
        });
    }
    if (
      profileData.isPublicProfile !== undefined &&
      typeof profileData.isPublicProfile !== "boolean"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "isPublicProfile must be a boolean" });
    }
    if (profileData.language && !["fr", "en"].includes(profileData.language)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid language. Must be 'fr' or 'en'.",
        });
    }

    const profile = await profileService.applyProfileUpdates(userId, profileData, file?.filename);
    res.status(200).json({ success: true, message: "Profile updated successfully", profile });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({
        success: false,
        message: error.message || "Failed to update profile",
      });
  }
};

module.exports.deleteResume = async (req, res) => {
  try {
    await profileService.deleteResume(req.user._id);
    res.status(200).json({ success: true, message: "Resume deleted." });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, error: error.message });
  }
};

module.exports.updateResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No resume file provided." });
    }

    const profile = await profileService.saveResume(
      req.user._id,
      req.file.filename,
    );

    const cvAnalysis = await CVAnalysisService.analyzeAndReplace(
      req.user._id,
      profile._id,
      req.file.filename,
      {
        name:      `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      },
    );

    // Background: recalculate match scores for all visited applications with the new CV
    if (cvAnalysis?._id) {
      jobApplicationService
        .recalculateScoresForVisitedApps(profile._id, cvAnalysis._id)
        .catch((err) => console.warn("⚠️ [CV Update] Background recalculation error:", err.message));
    }

    res.status(200).json({
      success: true,
      message: "Resume updated and analysed successfully.",
      data: {
        resume: profile.resume,
        cvAnalysis: cvAnalysis ? {
          _id:             cvAnalysis._id,
          analysisScore:   cvAnalysis.analysisScore,
          seniority:       cvAnalysis.seniority,
          skillsCount:     cvAnalysis.skills?.length     ?? 0,
          softSkillsCount: cvAnalysis.softSkills?.length ?? 0,
          createdAt:       cvAnalysis.createdAt,
        } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const path = require("path");
const fs   = require("fs");

const authService       = require("../services/authentication.service");
const CVAnalysisService = require("../services/cvAnalysis.service");
const Profile           = require("../models/Profile.model");
const User              = require("../models/User.model");
const logger            = require("../utils/logger");
const { analyzeCV }     = require("../services/analyseResume.service");
const { validateEmail, validateOTPInput } = require("../helpers/auth-validation.helpers");

// ─── Shared helpers ───────────────────────────────────────────────────────────

const handleError = (res, error, defaultStatus = 500) => {
  logger.error("Auth error:", error?.message || error);
  const status  = error?.status || defaultStatus;
  const message = error?.status ? error.message : "Internal server error";
  res.status(status).json({ success: false, error: message });
};

const deleteFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (err) => { if (err) logger.error("Failed to delete file:", err.message); });
};

const JWT_COOKIE = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

// ─── CV analysis helper ───────────────────────────────────────────────────────

const analyseCvAndEnrichProfile = async (resumeFile, validEmail, firstName, lastName, profileId, userId, req) => {
  if (!fs.existsSync(resumeFile.path)) return null;

  try {
    const cvData = JSON.parse(await analyzeCV(resumeFile.path));

    const { data: saved } = await CVAnalysisService.createCVAnalysis({
      name:              cvData.name || `${firstName} ${lastName}` || "Unknown",
      email:             validEmail,
      phone:             cvData.phone             || "",
      location:          cvData.location          || "",
      title:             cvData.title             || "",
      summary:           cvData.summary           || "",
      yearsOfExperience: cvData.yearsOfExperience || 0,
      seniority:         cvData.seniority         || "Entry-Level",
      skills:            cvData.skills            || [],
      softSkills:        cvData.softSkills        || [],
      spokenLanguages:   cvData.spokenLanguages   || [],
      experience:        cvData.experience        || [],
      education:         cvData.education         || [],
      certifications:    cvData.certifications    || [],
      projects:          cvData.projects          || [],
      links:             cvData.links             || { linkedin: "", github: "", portfolio: "" },
      User:              userId,
      sourceUrl:         resumeFile.path,
      ipAddress:         req.ip,
      userAgent:         req.get("user-agent"),
    }, profileId);

    const profileUpdate = {};

    if (cvData.skills?.length) {
      profileUpdate.$push = {
        skills: { $each: cvData.skills.map((name) => ({
          name, proficiencyLevel: 0, experienceLevel: "",
          NumberTestPassed: 0, ScoreTest: 0, Levelconfirmed: 0,
        })) },
      };
    }

    if (cvData.spokenLanguages?.length) {
      profileUpdate.$push = { ...(profileUpdate.$push || {}), spokenLanguages: { $each: cvData.spokenLanguages } };
    }

    if (cvData.email || cvData.links || cvData.location) {
      profileUpdate.$set = {
        contactInformation: {
          email:           cvData.email           || "",
          address:         "",
          linkedinUrl:     cvData.links?.linkedin || "",
          githubUrl:       cvData.links?.github   || "",
          personalWebsite: cvData.links?.portfolio|| "",
          location:        cvData.location        || "",
        },
        phone:          cvData.phone          || "",
        educationLevel: cvData.educationLevel || "",
        country:        cvData.country        || "",
      };
    }

    if (profileId && (profileUpdate.$push || profileUpdate.$set)) {
      await Profile.findByIdAndUpdate(profileId, profileUpdate, { runValidators: true });
    }

    return {
      id:              saved._id,
      analysisScore:   saved.analysisScore,
      seniority:       saved.seniority,
      skillsCount:     saved.skills.length,
      softSkillsCount: saved.softSkills.length,
      createdAt:       saved.createdAt,
    };
  } catch (err) {
    logger.warn("⚠️ CV analysis failed (non-fatal):", err.message);
    return null;
  }
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

module.exports.register = async (req, res) => {
  const resumeFile = req.file;
  try {
    const { email, roleType, firstName, lastName, name, companyDetails, phone, language } = req.body;
    const validEmail    = validateEmail(email);
    const validRoleType = roleType && ["Candidate", "Company", "Member"].includes(roleType) ? roleType : "Candidate";

    const result = await authService.registerUser(validEmail, validRoleType, {
      firstName, lastName, name, companyDetails, phone, resumeFile, language,
    });

    const cvAnalysis = (resumeFile?.path && validRoleType === "Candidate" && result.user)
      ? await analyseCvAndEnrichProfile(resumeFile, validEmail, firstName, lastName, result.profile?._id, result.user._id, req)
      : null;

    res.status(201).json({
      success:  true,
      message:  result.message,
      email:    result.email,
      username: result.username,
    });
  } catch (error) {
    deleteFile(resumeFile?.path);
    handleError(res, error, 400);
  }
};

module.exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(validateEmail(req.body.email), req.body.language);
    res.status(200).json({ success: true, message: result.message, email: result.email, username: result.username });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const { email: validEmail, otp: validOTP } = validateOTPInput(req.body.email, req.body.otp);
    const result = await authService.verifyUserOTP(validEmail, validOTP, req.body.location);

    res.cookie("jwt_token", result.token, JWT_COOKIE);

    const p = result.profile;
    const safeProfile = p ? {
      _id:                     p._id,
      userId:                  p.userId,
      type:                    p.type,
      firstName:               p.firstName,
      lastName:                p.lastName,
      user_image:              p.user_image,
      phone:                   p.phone,
      language:                p.language,
      timeZone:                p.timeZone,
      country:                 p.country,
      isPublicProfile:         p.isPublicProfile,
      quota:                   p.quota,
      planUsage:               p.planUsage,
      overallScore:            p.overallScore,
      contactInformation:      p.contactInformation,
      companyDetails:          p.companyDetails,
      requiredExperienceLevel: p.requiredExperienceLevel,
      requiredSkills:          p.requiredSkills,
      skills:     (p.skills     || []).map(s => ({ _id: s._id, name: s.name, Levelconfirmed: s.Levelconfirmed })),
      softSkills: (p.softSkills || []).map(s => ({ _id: s._id, name: s.name, category: s.category })),
    } : null;

    res.status(200).json({
      success:           true,
      message:           "Email verified successfully",
      token:             result.token,
      user:              result.user,
      profile:           safeProfile,
      planLimits:        result.planLimits        || null,
      companyMembership: result.companyMembership || null,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.resendOTP = async (req, res) => {
  try {
    const result = await authService.resendOTP(validateEmail(req.body.email), req.body.language);
    res.status(200).json({ success: true, message: result.message, email: result.email, username: result.username });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.logout = (req, res) => {
  try {
    res.clearCookie("jwt_token");
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          logger.error("Session destruction error:", err.message);
          return res.status(500).json({ success: false, error: "Logout failed" });
        }
        res.status(200).json({ success: true, message: "Logout successful" });
      });
    } else {
      res.status(200).json({ success: true, message: "Logout successful" });
    }
  } catch (error) {
    handleError(res, error, 500);
  }
};

module.exports.checkRole = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'email query param required' });
    const User = require('../models/User.model');
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('role').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, role: user.role });
  } catch (error) {
    handleError(res, error, 500);
  }
};

module.exports.warnUser = async (req, res) => {
  try {
    if (!req.user?.email) return res.status(401).json({ success: false, error: "User not authenticated" });
    const result = await authService.warnUser(req.user.email);
    res.status(200).json({ success: true, message: result.message, user: result.user });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.parseCV = async (req, res) => {
  try {
    const { filePath, saveToDatabase = true } = req.body || req.query;
    if (!filePath) return res.status(400).json({ success: false, error: "filePath is required" });

    const uploadsRoot  = path.resolve(__dirname, "..", "uploads");
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(uploadsRoot))
      return res.status(400).json({ success: false, error: "Invalid file path" });

    if (!fs.existsSync(resolvedPath))
      return res.status(404).json({ success: false, error: "CV file not found" });

    const cvData = JSON.parse(await analyzeCV(resolvedPath));
    let dbRecord = null;

    if (saveToDatabase) {
      try {
        let profileId = null;
        if (req.user?._id) {
          const p = await Profile.findOne({ userId: req.user._id }).lean().select("_id");
          profileId = p?._id ?? null;
        }
        const { data } = await CVAnalysisService.createCVAnalysis({
          ...cvData,
          sourceUrl: resolvedPath,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          ...(req.user && { User: req.user._id }),
        }, profileId);
        dbRecord = { id: data._id, analysisScore: data.analysisScore, createdAt: data.createdAt };
      } catch (err) {
        logger.warn("⚠️ CV analysis DB save failed:", err.message);
      }
    }

    res.status(200).json({ success: true, data: cvData, databaseRecord: dbRecord });
  } catch (error) {
    if (error?.message?.includes("unsupported countries") || error?.message?.includes("AccessDenied"))
      return res.status(403).json({ success: false, error: "CV analysis service unavailable in your region." });
    handleError(res, error, 400);
  }
};

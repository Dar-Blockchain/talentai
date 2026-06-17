const CVAnalysis  = require("./cv-analysis.model");
const Profile     = require("../users/profile.model");
const User        = require("../users/user.model");
const { analyzeCV } = require("./analyse-resume.service");
const fs   = require("fs");
const path = require("path");

class CVAnalysisService {
  static normalizeSpokenLanguages(languages) {
    if (!Array.isArray(languages)) return [];
    return languages
      .map((lang) => {
        if (typeof lang === "object" && lang.language) return { language: lang.language, proficiency: lang.proficiency || "" };
        if (typeof lang === "string")                  return { language: lang, proficiency: "" };
        return null;
      })
      .filter(Boolean);
  }

  static normalizeSoftSkills(softSkills) {
    if (!Array.isArray(softSkills)) return [];
    return softSkills
      .map((skill) =>
        typeof skill === "object" && skill.name
          ? { name: skill.name, category: skill.category || "", proficiencyLevel: skill.proficiencyLevel || 0, experienceLevel: skill.experienceLevel || "" }
          : null
      )
      .filter(Boolean);
  }

  static normalizeCVData(cvData) {
    return {
      ...cvData,
      spokenLanguages: this.normalizeSpokenLanguages(cvData.spokenLanguages),
      softSkills:      this.normalizeSoftSkills(cvData.softSkills),
    };
  }

  static validateCVData(data) {
    if (!data.name || !data.email) throw Object.assign(new Error("Name and email are required fields."), { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw Object.assign(new Error("Invalid email format."), { status: 400 });
    return data;
  }

  static calculateAnalysisScore(data) {
    let score = 0;
    if (data.name && data.email)                        score += 10;
    if (data.phone && data.location)                    score += 10;
    if (data.title)                                     score += 10;
    if (data.summary?.length > 50)                      score += 10;
    if (data.yearsOfExperience >= 0)                    score += 10;
    if (data.seniority && data.seniority !== "Entry-Level") score += 5;
    if (data.skills?.length)      score += Math.min(15, data.skills.length * 1.5);
    if (data.softSkills?.length)  score += Math.min(10, data.softSkills.length * 2);
    if (data.education?.length)   score += Math.min(15, data.education.length * 7.5);
    if (data.experience?.length)  score += Math.min(15, data.experience.length * 5);
    return Math.min(100, Math.round(score));
  }

  static async replaceForProfile(cvData, profileId) {
    const existing = await CVAnalysis.find({ profile: profileId }).select("_id");
    if (existing.length) {
      await Promise.all([
        CVAnalysis.deleteMany({ profile: profileId }),
        Profile.findByIdAndUpdate(profileId, { $set: { cvAnalyses: [] } }),
      ]);
    }
    return this.createCVAnalysis(cvData, profileId);
  }

  static async createCVAnalysis(cvData, profileId = null) {
    const normalized    = this.normalizeCVData(cvData);
    this.validateCVData(normalized);

    const cvAnalysis = await new CVAnalysis({
      ...normalized,
      analysisScore:  this.calculateAnalysisScore(normalized),
      analysisStatus: "completed",
      profile:        profileId,
    }).save();

    if (profileId) {
      const push = { cvAnalyses: cvAnalysis._id };
      if (normalized.softSkills?.length)      push.softSkills      = { $each: normalized.softSkills };
      if (normalized.spokenLanguages?.length) push.spokenLanguages = { $each: normalized.spokenLanguages };
      await Profile.findByIdAndUpdate(profileId, { $push: push });
    }

    return { success: true, data: cvAnalysis };
  }

  static async getCVAnalysisById(id) {
    const cvAnalysis = await CVAnalysis.findById(id).populate("profile");
    if (!cvAnalysis) throw Object.assign(new Error("CV analysis not found."), { status: 404 });
    return { success: true, data: cvAnalysis };
  }

  static async getAllCVAnalyses(options = {}) {
    const { page = 0, limit = 10, seniority, search, minScore } = options;
    const skip   = Math.max(0, page) * Math.min(limit, 100);
    const filter = {};
    if (seniority) filter.seniority = seniority;
    if (minScore)  filter.analysisScore = { $gte: parseInt(minScore) };
    if (search)    filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];

    const [total, cvAnalyses] = await Promise.all([
      CVAnalysis.countDocuments(filter),
      CVAnalysis.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(limit, 100)),
    ]);
    return { success: true, data: cvAnalyses, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async updateCVAnalysis(id, updateData) {
    const normalized = this.normalizeCVData(updateData);
    if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      throw Object.assign(new Error("Invalid email format."), { status: 400 });
    }
    const original = await CVAnalysis.findById(id);
    if (!original) throw Object.assign(new Error("CV analysis not found."), { status: 404 });

    const merged = { ...original.toObject(), ...normalized };
    const cvAnalysis = await CVAnalysis.findByIdAndUpdate(
      id,
      { ...normalized, analysisScore: this.calculateAnalysisScore(merged) },
      { new: true, runValidators: true }
    );
    return { success: true, data: cvAnalysis };
  }

  static async deleteCVAnalysis(id) {
    const cvAnalysis = await CVAnalysis.findByIdAndDelete(id);
    if (!cvAnalysis) throw Object.assign(new Error("CV analysis not found."), { status: 404 });
    if (cvAnalysis.profile) {
      await Profile.findByIdAndUpdate(cvAnalysis.profile, { $pull: { cvAnalyses: id } });
    }
    return { success: true, message: "CV analysis deleted successfully.", data: cvAnalysis };
  }

  static async getCVAnalysesByUserId(userId, options = {}) {
    return this._paginate({ User: userId }, options);
  }

  static async getCVAnalysesByCompanyId(companyId, options = {}) {
    return this._paginate({ Company: companyId }, options);
  }

  static async getCVAnalysesByProfileId(profileId, options = {}) {
    return this._paginate({ profile: profileId }, options);
  }

  static async getCVAnalysesBySeniority(seniority, options = {}) {
    return this._paginate({ seniority }, { ...options, sort: { analysisScore: -1 }, populate: "profile" });
  }

  static async searchCVAnalyses(query, options = {}) {
    const filter = {
      $or: [
        { name:    { $regex: query, $options: "i" } },
        { email:   { $regex: query, $options: "i" } },
        { title:   { $regex: query, $options: "i" } },
        { summary: { $regex: query, $options: "i" } },
        { skills:  { $in: [new RegExp(query, "i")] } },
      ],
    };
    return this._paginate(filter, options);
  }

  static async getCVAnalysisStats() {
    const [totalRecords, avgScore, seniorityDistribution, topSkills] = await Promise.all([
      CVAnalysis.countDocuments(),
      CVAnalysis.aggregate([{ $group: { _id: null, avgScore: { $avg: "$analysisScore" } } }]),
      CVAnalysis.aggregate([{ $group: { _id: "$seniority", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      CVAnalysis.aggregate([{ $unwind: "$skills" }, { $group: { _id: "$skills", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
    ]);
    return { success: true, data: { totalRecords, avgAnalysisScore: avgScore[0]?.avgScore || 0, seniorityDistribution, topSkills } };
  }

  static async associateCVAnalysisWithProfile(cvAnalysisId, profileId) {
    const cvAnalysis = await CVAnalysis.findByIdAndUpdate(cvAnalysisId, { profile: profileId }, { new: true });
    if (!cvAnalysis) throw Object.assign(new Error("CV analysis not found."), { status: 404 });
    await Profile.findByIdAndUpdate(profileId, { $addToSet: { cvAnalyses: cvAnalysisId } });
    return { success: true, message: "CV analysis associated with profile successfully.", data: cvAnalysis };
  }

  static async disassociateCVAnalysisFromProfile(cvAnalysisId) {
    const cvAnalysis = await CVAnalysis.findById(cvAnalysisId);
    if (!cvAnalysis) throw Object.assign(new Error("CV analysis not found."), { status: 404 });
    const [updated] = await Promise.all([
      CVAnalysis.findByIdAndUpdate(cvAnalysisId, { $unset: { profile: 1 } }, { new: true }),
      cvAnalysis.profile
        ? Profile.findByIdAndUpdate(cvAnalysis.profile, { $pull: { cvAnalyses: cvAnalysisId } })
        : null,
    ]);
    return { success: true, message: "CV analysis disassociated from profile successfully.", data: updated };
  }

  static async analyzeResumeBg(userId, profileId, filename, meta = {}) {
    const resumePath = path.join(__dirname, "..", "..", "uploads", "resumes", filename);
    if (!fs.existsSync(resumePath)) return;

    const user   = await User.findById(userId).select("email");
    const cvData = JSON.parse(await analyzeCV(resumePath));

    await CVAnalysisService.replaceForProfile({
      name:              cvData.name || meta.name || "Unknown",
      email:             user?.email || "",
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
      sourceUrl:         resumePath,
      ipAddress:         meta.ipAddress,
      userAgent:         meta.userAgent,
    }, profileId);

    const profileUpdate = {};
    if (cvData.skills?.length) {
      profileUpdate.$push = {
        skills: { $each: cvData.skills.map((name) => ({ name, proficiencyLevel: 0, experienceLevel: "", NumberTestPassed: 0, ScoreTest: 0, Levelconfirmed: 0 })) },
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
    if (Object.keys(profileUpdate).length) {
      await Profile.findByIdAndUpdate(profileId, profileUpdate);
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  static async _paginate(filter, options = {}) {
    const page  = Math.max(0, options.page  || 0);
    const limit = Math.min(options.limit || 10, 100);
    const skip  = page * limit;
    const sort  = options.sort || { createdAt: -1 };

    let query = CVAnalysis.find(filter).sort(sort).skip(skip).limit(limit);
    if (options.populate) query = query.populate(options.populate);

    const [total, data] = await Promise.all([CVAnalysis.countDocuments(filter), query]);
    return { success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }
}

module.exports = CVAnalysisService;

const Profile = require("./profile.model");
const User = require("./user.model");
const Post = require("../posts/post.model");
const CompanyMembership = require("../company-members/company-membership.model");
const fs = require("fs");
const path = require("path");

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports.updateCandidateProfile = async (userId, profileData) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });

  if (profileData.isPublicProfile         !== undefined) profile.isPublicProfile         = profileData.isPublicProfile;
  if (profileData.firstName               !== undefined) profile.firstName               = profileData.firstName;
  if (profileData.lastName                !== undefined) profile.lastName                = profileData.lastName;
  if (profileData.gender                  !== undefined) profile.gender                  = profileData.gender;
  if (profileData.timeZone                !== undefined) profile.timeZone                = profileData.timeZone;
  if (profileData.phone                   !== undefined) profile.phone                   = profileData.phone;
  if (profileData.targetRole              !== undefined) profile.targetRole              = profileData.targetRole;
  if (profileData.requiredExperienceLevel !== undefined) profile.requiredExperienceLevel = profileData.requiredExperienceLevel;

  const ci = profileData.contactInformation ?? {};
  if (ci.location        !== undefined) profile.contactInformation.location        = ci.location;
  if (ci.address         !== undefined) profile.contactInformation.address         = ci.address;
  if (ci.linkedinUrl     !== undefined) profile.contactInformation.linkedinUrl     = ci.linkedinUrl;
  if (ci.githubUrl       !== undefined) profile.contactInformation.githubUrl       = ci.githubUrl;
  if (ci.personalWebsite !== undefined) profile.contactInformation.personalWebsite = ci.personalWebsite;

  await profile.save();
  return profile;
};

module.exports.updateCompanyProfile = async (userId, profileData) => {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw Object.assign(new Error("Profile not found"), { status: 404 });

  if (profileData.isPublicProfile !== undefined) profile.isPublicProfile = profileData.isPublicProfile;

  const cd = profileData.companyDetails ?? {};
  if (cd.name           !== undefined) profile.companyDetails.name           = cd.name;
  if (cd.industry       !== undefined) profile.companyDetails.industry       = cd.industry;
  if (cd.size           !== undefined) profile.companyDetails.size           = cd.size;
  if (cd.employmentType !== undefined) profile.companyDetails.employmentType = cd.employmentType;
  if (cd.location       !== undefined) profile.companyDetails.location       = cd.location;
  if (cd.linkedin       !== undefined) profile.companyDetails.linkedin       = cd.linkedin;
  if (cd.website        !== undefined) profile.companyDetails.website        = cd.website;
  if (cd.phone          !== undefined) profile.companyDetails.phone          = cd.phone;

  await profile.save();
  return profile;
};


module.exports.updateUserImage = async (userId, newFilename) => {
  if (!userId) throw new Error("Missing user ID.");
  if (!newFilename) throw new Error("Missing image filename.");

  const profile = await Profile.findOne({ userId: userId.toString() });
  if (!profile) throw new Error("Profile not found.");

  const oldImage = profile.user_image;
  const updated = await Profile.findByIdAndUpdate(
    profile._id,
    { user_image: newFilename },
    { new: true },
  );

  if (oldImage && oldImage !== newFilename) {
    const oldPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "images",
      oldImage,
    );
    fs.access(oldPath, fs.constants.F_OK, (err) => {
      if (!err) fs.unlink(oldPath, () => {});
    });
  }

  return updated;
};

module.exports.getProfileByUserId = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const ProfileSkill = require("../skills/profile-skill.model");
  const [profile, companyMembership] = await Promise.all([
    user.profile ? Profile.findById(user.profile).populate("planLimits") : null,
    user.companyMembership
      ? CompanyMembership.findById(user.companyMembership)
          .populate(MEMBERSHIP_POPULATE)
          .select("_id role updatedAt company")
      : null,
  ]);

  // Attach skills from dedicated collections onto the profile object for API consumers
  if (profile) {
    const [skills, softSkills] = await Promise.all([
      ProfileSkill.find({ profile: profile._id, kind: "technical" }).lean(),
      ProfileSkill.find({ profile: profile._id, kind: "soft" }).lean(),
    ]);
    profile.skills     = skills;
    profile.softSkills = softSkills;
  }

  let planLimits = profile?.planLimits || null;

  // Auto-assign Trial plan for Company profiles that have no plan yet
  if (profile && !planLimits && user.role === "Company") {
    try {
      const {
        assignFreePlanToProfile,
      } = require("../auth/auth.service");
      await assignFreePlanToProfile(profile._id);
      const refreshed = await Profile.findById(profile._id).populate(
        "planLimits",
      );
      planLimits = refreshed?.planLimits || null;
    } catch (e) {
      console.warn("Auto-assign Trial on getMyProfile failed:", e.message);
    }
  }

  return {
    success: true,
    message: "Profile retrieved successfully",
    user,
    profile,
    planLimits,
    companyMembership,
  };
};

module.exports.applyProfileUpdates = async (userId, profileData, filename) => {
  const { validateCandidateFields } = require("./profile.validation");

  const [, imageProfile] = await Promise.all([
    profileData.language ? User.findByIdAndUpdate(userId, { language: profileData.language }) : null,
    filename ? module.exports.updateUserImage(userId, filename) : null,
  ]);

  if (!Object.values(profileData).some(Boolean)) return imageProfile ?? null;

  const existing = await module.exports
    .getProfileByUserId(userId)
    .catch(() => null);
  const accountType =
    existing?.profile?.type ||
    (existing?.user?.role === "Company"
      ? "Company"
      : existing?.user?.role === "Member"
        ? "Member"
        : "Candidate");

  if (accountType === "Company") {
    const cd = profileData.companyDetails || {};
    if (cd.name != null && typeof cd.name !== "string") {
      const err = new Error("Company name must be a string");
      err.status = 400;
      throw err;
    }
    if (
      cd.employmentType &&
      !["Remote", "Hybrid", "On-site"].includes(cd.employmentType)
    ) {
      const err = new Error(
        "Invalid employment type. Must be 'Remote', 'Hybrid', or 'On-site'",
      );
      err.status = 400;
      throw err;
    }
    return await module.exports.updateCompanyProfile(userId, profileData);
  } else {
    const fieldErr = validateCandidateFields(profileData, false);
    if (fieldErr) {
      const err = new Error(fieldErr);
      err.status = 400;
      throw err;
    }
    return await module.exports.updateCandidateProfile(userId, profileData);
  }
};

module.exports.checkActiveApplications = async (profileId) => {
  const JobApplication = require("../job-applications/job-application.model");
  return JobApplication.exists({ profile: profileId, status: { $in: ["visited"] } });
};

module.exports.deleteResume = async (userId) => {
  const CVAnalysis = require("../cv-analysis/cv-analysis.model");

  const profile = await Profile.findOne({ userId }).select("_id resume");
  if (!profile) {
    const err = new Error("Profile not found.");
    err.status = 404;
    throw err;
  }

  const hasActive = await module.exports.checkActiveApplications(profile._id);
  if (hasActive) {
    const err = new Error("You have pending job applications. Please withdraw them before deleting your CV.");
    err.status = 409;
    throw err;
  }

  if (profile.resume) {
    const filePath = path.join(__dirname, "..", "..", "uploads", "resumes", profile.resume);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // Preserve CVAnalysis docs still referenced by existing job applications
  const JobApplication   = require("../job-applications/job-application.model");
  const ProfileSkill = require("../skills/profile-skill.model");
  const linkedIds = (await JobApplication.distinct("cvAnalysis", { profile: profile._id })).filter(Boolean);

  const deletingIds = (await CVAnalysis.find({ profile: profile._id, _id: { $nin: linkedIds } }).select("_id")).map((d) => d._id);

  await CVAnalysis.deleteMany({ profile: profile._id, _id: { $nin: linkedIds } });
  await Profile.findOneAndUpdate({ userId }, { $set: { resume: "", cvAnalyses: linkedIds } });

  // Remove unverified skills (technical and soft) whose sole source was the deleted CVs
  if (deletingIds.length) {
    const deletingIdSet = deletingIds.map(String);

    const affected = await ProfileSkill.find({ profile: profile._id, sourceCvAnalyses: { $in: deletingIds } });
    await Promise.all(
      affected.map(async (skill) => {
        const remaining = skill.sourceCvAnalyses.map(String).filter((id) => !deletingIdSet.includes(id));
        const isVerified = (skill.levelConfirmed ?? 0) > 0 || (skill.numberTestPassed ?? 0) > 0;
        if (!isVerified && remaining.length === 0) {
          await ProfileSkill.deleteOne({ _id: skill._id });
        } else {
          await ProfileSkill.updateOne({ _id: skill._id }, { $pull: { sourceCvAnalyses: { $in: deletingIds } } });
        }
      })
    );
  }
};

module.exports.saveResume = async (userId, filename) => {
  const profile = await Profile.findOneAndUpdate(
    { userId },
    { resume: filename },
    { new: true },
  ).select("_id resume firstName lastName");
  if (!profile) {
    const err = new Error("Profile not found.");
    err.status = 404;
    throw err;
  }
  return profile;
};

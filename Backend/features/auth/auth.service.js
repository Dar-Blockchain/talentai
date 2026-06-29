const User    = require("../users/user.model");
const Profile = require("../users/profile.model");
const logger  = require("../../utils/logger");
const { sendOTP }                              = require("../../utils/email.service");
const { generateOTP }                          = require("./one-time-password");
const { generateToken }                        = require("./generate-token");
const { extractUsernameFromEmail, formatLocation } = require("./auth.validation");

const CompanyMembership = require("../company-members/company-membership.model");
const PlanLimits        = require("../billing/plans/plan-limits.model");
const Subscription      = require("../billing/subscriptions/subscription.model");

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const OTP_EXPIRY_MS    = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

// ─── OTP brute-force protection ───────────────────────────────────────────────
// In-memory per-email attempt counter. Resets on server restart; for
// multi-process deployments replace with a Redis-backed counter.

const _otpAttempts = new Map(); // email → { count, windowStart }

function checkOtpRateLimit(email) {
  const now   = Date.now();
  const entry = _otpAttempts.get(email);

  if (!entry || now - entry.windowStart >= OTP_EXPIRY_MS) {
    _otpAttempts.set(email, { count: 1, windowStart: now });
    return;
  }

  entry.count += 1;
  if (entry.count > OTP_MAX_ATTEMPTS) {
    throw Object.assign(
      new Error("Too many verification attempts. Please request a new code."),
      { status: 429 },
    );
  }
}

function clearOtpRateLimit(email) {
  _otpAttempts.delete(email);
}

// â”€â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const assignFreePlanToProfile = module.exports.assignFreePlanToProfile = async (profileId) => {
  try {
    if (await Subscription.countDocuments({ companyProfileId: profileId })) return;

    const freePlan = await PlanLimits.findOne({ name: "Trial", isActive: true }).lean();
    if (!freePlan) { logger.warn("âš ï¸ Free plan not found â€” skipping auto-assign"); return; }

    const startDate = new Date();
    const endDate   = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100);

    const subscription = await Subscription.create({
      companyProfileId: profileId,
      planId:           freePlan._id,
      startDate, endDate,
      status: "active", autoRenew: false,
      postsUsed: 0, monthlyInterviewsUsed: 0,
    });

    await Profile.findByIdAndUpdate(profileId, {
      activeSubscription: subscription._id,
      $addToSet:          { subscriptions: subscription._id },
      planLimits:         freePlan._id,
    }, { runValidators: false });

  } catch (err) {
    logger.error("âŒ Failed to assign free plan:", err.message);
  }
};

/** Write a fresh OTP to the user document. */
const issueOtp = async (userId) => {
  const code      = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await User.updateOne({ _id: userId }, { otp: { code, expiresAt } });
  return code;
};

/** Shared guard used by loginUser and resendOTP. */
const assertUserCanReceiveOtp = (user) => {
  if (!user)       throw Object.assign(new Error("No account found with this email. Please register first."), { status: 404 });
  if (user.isBanned) throw Object.assign(new Error("Your account has been banned. Please contact support."), { status: 403 });
};

// â”€â”€â”€ Register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports.registerUser = async (email, roleType = "Candidate", opts = {}) => {
  if (!email) throw Object.assign(new Error("Email is required"), { status: 400 });

  const validRole = ["Company", "Member", "Employee"].includes(roleType) ? roleType : "Candidate";

  const existing = await User.findOne({ email }).select("_id isVerified username language").lean();
  if (existing) {
    if (existing.isVerified)
      throw Object.assign(new Error("User already exists. Please sign in instead."), { status: 409 });
    const code = await issueOtp(existing._id);
    await sendOTP(email, code, existing.language || "en");
    return { email, username: existing.username, message: "A new verification code has been sent to your email." };
  }

  let username = extractUsernameFromEmail(email);
  if (await User.findOne({ username }).lean().select("_id")) {
    const count = await User.countDocuments({ username: new RegExp(`^${username}\\d*$`) });
    username = `${username}${count + 1}`;
  }

  const otpCode = generateOTP();
  const user = await User.create({
    username, email,
    FirstName:   opts.firstName || "",
    LastName:    opts.lastName  || "",
    role:        validRole,
    language:    opts.language  || "en",
    otp: { code: otpCode, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) },
  });

  let profile = null;
  const resumePath = opts.resumeFile?.filename || "";

  if (validRole === "Company" && (opts.name || opts.companyDetails?.name)) {
    profile = await Profile.create({
      userId: user._id, type: "Company",
      companyDetails: {
        email:    opts.companyDetails?.email    || email,
        name:     opts.companyDetails?.name     || opts.name || "",
        industry: opts.companyDetails?.industry || "",
        size:     opts.companyDetails?.size     || "",
        location: opts.companyDetails?.location || "",
        website:  opts.companyDetails?.website  || "",
        linkedin: opts.companyDetails?.linkedin || "",
      },
      requiredExperienceLevel: "Entry Level",
    });
  } else if (validRole === "Member" || validRole === "Employee") {
    profile = await Profile.create({
      userId: user._id, type: validRole === "Employee" ? "Employee" : "Member",
      firstName: opts.firstName, lastName: opts.lastName,
      phone: opts.phone || "", overallScore: 0,
    });
  } else if (validRole === "Candidate") {
    profile = await Profile.create({
      userId: user._id, type: "Candidate",
      firstName: opts.firstName, lastName: opts.lastName,
      phone: opts.phone || "", resume: resumePath, overallScore: 0,
    });
  }

  if (profile) {
    const tasks = [User.updateOne({ _id: user._id }, { profile: profile._id })];
    if (validRole === "Company") tasks.push(assignFreePlanToProfile(profile._id));
    await Promise.all(tasks);
  }

  await sendOTP(email, otpCode, user.language || "en");

  return {
    email, username,
    user:    user.toObject(),
    profile: profile?.toObject() ?? null,
    message: "Registration successful. Please check your email for your verification code.",
  };
};

// â”€â”€â”€ Verify OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports.verifyUserOTP = async (email, otp, location = null) => {
  const user = await User.findOne({ email });
  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });

  if (user.isBanned) {
    throw Object.assign(new Error("Your account has been banned. Please contact support."), { status: 403 });
  }
  if (!user.otp?.code || !user.otp?.expiresAt)
    throw Object.assign(new Error("No active OTP. Please request a new one."), { status: 400 });

  if (new Date() > user.otp.expiresAt) {
    throw Object.assign(new Error("OTP has expired. Please request a new one."), { status: 401 });
  }

  checkOtpRateLimit(email); // throws 429 after OTP_MAX_ATTEMPTS failures

  if (user.otp.code !== otp) {
    throw Object.assign(new Error("Invalid OTP code. Please check and try again."), { status: 401 });
  }

  clearOtpRateLimit(email); // successful match — reset the counter

  const locationUpdate = location
    ? { ip: location.ip, Localisation: formatLocation(location) }
    : {};

  const now = new Date();
  await Promise.all([
    User.updateOne(
      { _id: user._id },
      {
        $unset: { otp: "" },
        $set: {
          isVerified: true,
          lastLogin: now,
          ...locationUpdate,
        },
      }
    ),
  ]);

  const updatedUser = {
    _id:        user._id,
    email:      user.email,
    username:   user.username,
    role:       user.role,
    user_image: user.user_image,
    isVerified: true,
    lastLogin:  now,
  };

  const [profile, companyMembership] = await Promise.all([
    user.profile
      ? Profile.findById(user.profile)
          .select("_id userId type firstName lastName user_image phone language timeZone country isPublicProfile quota planUsage overallScore contactInformation companyDetails requiredExperienceLevel")
          .lean()
      : null,
    user.companyMembership
      ? CompanyMembership.findById(user.companyMembership)
          .populate({ path: "company", select: "username email user_image" })
          .populate({ path: "department", select: "name" })
          .select("_id role company department")
          .lean()
      : null,
  ]);

  let planLimits = null;
  if (profile?.planLimits) {
    try {
      planLimits = await PlanLimits.findById(profile.planLimits)
        .select("name postsLimit monthlyInterviewLimit")
        .lean();
    } catch { /* non-critical */ }
  }

  const token = generateToken(
    updatedUser._id,
    companyMembership?.company?._id ?? null,
    updatedUser.role
  );

  return { user: updatedUser, token, profile, planLimits, companyMembership };
};

// â”€â”€â”€ Login (send OTP) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports.loginUser = async (email) => {
  const user = await User.findOne({ email }).select("_id username isBanned language").lean();
  assertUserCanReceiveOtp(user);

  const code = await issueOtp(user._id);
  await sendOTP(email, code, user.language || 'en');

  return { email, username: user.username, message: 'Verification code sent to your email.' };
};

module.exports.resendOTP = async (email) => {
  const user = await User.findOne({ email }).select('_id username isBanned language').lean();
  assertUserCanReceiveOtp(user);

  const code = await issueOtp(user._id);
  await sendOTP(email, code, user.language || 'en');

  return { email, username: user.username, message: 'New verification code sent. Valid for 5 minutes.' };
};

// â”€â”€â”€ Get current user (me) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports.getMe = async (userId) => {
  const [user, profile] = await Promise.all([
    User.findById(userId)
      .select("_id email username role user_image isBanned lastLogin")
      .lean(),
    Profile.findOne({ userId })
      .select("_id type firstName lastName user_image phone country language timeZone isPublicProfile quota planUsage overallScore contactInformation companyDetails planLimits")
      .lean(),
  ]);

  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });

  return { user, profile: profile ?? null };
};

// â”€â”€â”€ Warn user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

module.exports.warnUser = async (email) => {
  const user = await User.findOne({ email }).select("_id email warnings isBanned").lean();
  if (!user)       throw Object.assign(new Error("User not found."), { status: 404 });
  if (user.isBanned) return { message: "User is already banned.", user };

  const newWarnings = (user.warnings || 0) + 1;
  const updated = await User.findByIdAndUpdate(
    user._id,
    { warnings: newWarnings, ...(newWarnings >= 3 && { isBanned: true }) },
    { new: true }
  ).lean().select("_id email warnings isBanned");

  return {
    message: newWarnings >= 3 ? "User banned after 3 warnings." : `Warning ${newWarnings}/3 issued.`,
    user: updated,
  };
};

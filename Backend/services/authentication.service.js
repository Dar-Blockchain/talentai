const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const { sendOTP } = require("../utils/email-service");
const { generateOTP } = require("../utils/one-time-password");
const { generateToken } = require("../utils/generate-token");
const { getGmailByToken } = require("../utils/google-auth.service");
const { extractUsernameFromEmail, formatLocation } = require("../helpers/auth-validation.helpers");

const assignFreePlanToProfile = async (profileId) => {
  try {
    const PlanLimits = require("../models/PlanLimits.model");
    const Subscription = require("../models/Subscription.model");

    const existing = await Subscription.countDocuments({ companyProfileId: profileId });
    if (existing > 0) return;

    const freePlan = await PlanLimits.findOne({ name: "Trial", isActive: true });
    if (!freePlan) {
      console.warn("⚠️ Free plan not found in DB — skipping auto-assign");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100);

    const subscription = await Subscription.create({
      companyProfileId: profileId,
      planId: freePlan._id,
      startDate,
      endDate,
      status: "active",
      autoRenew: false,
      postsUsed: 0,
      monthlyInterviewsUsed: 0,
    });

    await Profile.findByIdAndUpdate(
      profileId,
      {
        activeSubscription: subscription._id,
        $addToSet: { subscriptions: subscription._id },
        planLimits: freePlan._id,
      },
      { runValidators: false }
    );

    console.log(`✅ Free plan auto-assigned to profile ${profileId}`);
  } catch (err) {
    console.error("❌ Failed to assign Free plan:", err.message);
  }
};

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Service d'inscription
module.exports.registerUser = async (email, roleType = 'Candidate', profileDataOptions = {}) => {
  try {
    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    let username = extractUsernameFromEmail(email);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    // Check if user exists by email only
    const existingUser = await User.findOne({ email }).select('_id isVerified');

    if (existingUser) {
      if (existingUser.isVerified) {
        // Fully registered user — block
        const err = new Error('User already exists. Please use login instead.');
        err.status = 409;
        throw err;
      }
      // Unverified user — resend a fresh OTP so they can complete registration
      await User.findByIdAndUpdate(existingUser._id, {
        otp: { code: otp, expiresAt: otpExpiry },
      });
      const emailSent = await sendOTP(email, otp);
      if (!emailSent) {
        const err = new Error('Error sending OTP email');
        err.status = 500;
        throw err;
      }
      return {
        email,
        username: existingUser.username,
        message: 'A new verification code has been sent to your email.',
      };
    }

    // If username is taken, append a number to make it unique
    const usernameConflict = await User.findOne({ username }).lean().select('_id');
    if (usernameConflict) {
      const count = await User.countDocuments({ username: { $regex: `^${username}` } });
      username = `${username}${count + 1}`;
    }

    // Determine user role
    const userRole = roleType === 'Company' ? 'Company' : roleType === 'Member' || roleType === 'Employee' ? roleType : 'Candidate';

    // Create new user
    const user = new User({
      username,
      email,
      FirstName: profileDataOptions.firstName || '',
      LastName: profileDataOptions.lastName || '',
      role: userRole,
      otp: {
        code: otp,
        expiresAt: otpExpiry
      }
    });

    await user.save();

    // Create profile based on roleType
    let profile = null;

    if (roleType === 'Company') {
      // For Company: need at least email or name
      if (profileDataOptions.name || profileDataOptions.companyDetails?.name) {
        profile = await Profile.create({
          userId: user._id,
          type: 'Company',
          companyDetails: {
            email: profileDataOptions.companyDetails?.email || email,
            name: profileDataOptions.companyDetails?.name || profileDataOptions.name || '',
            industry: profileDataOptions.companyDetails?.industry || '',
            size: profileDataOptions.companyDetails?.size || '',
            location: profileDataOptions.companyDetails?.location || '',
            website: profileDataOptions.companyDetails?.website || '',
            linkedin: profileDataOptions.companyDetails?.linkedin || '',
          },
          requiredSkills: [],
          requiredExperienceLevel: 'Entry Level',
        });
        console.log('✅ Company profile created during registration for userId:', user._id);

        // Link profile to user as ObjectID
        user.profile = profile._id;
        await user.save();
        console.log('🔗 Company profile linked to user - user.profile:', profile._id);

        // Auto-assign Free plan immediately at registration
        await assignFreePlanToProfile(profile._id);
      }
    } else if (roleType === 'Member' || roleType === 'Employee') {
      // For Member and Employee: create profile similar to Candidate
      profile = await Profile.create({
        userId: user._id,
        type: roleType === 'Employee' ? 'Employee' : 'Member',
        firstName: profileDataOptions.firstName,
        lastName: profileDataOptions.lastName,
        phone: profileDataOptions.phone || '',
        skills: [],
        overallScore: 0,
      });
      console.log(`✅ ${roleType} profile created during registration for userId:`, user._id);

      // Link profile to user as ObjectID
      user.profile = profile._id;
      await user.save();
      console.log(`🔗 ${roleType} profile linked to user - user.profile:`, profile._id);
    } else {
      // For Candidate: create profile with firstName and lastName (now required)
      const resumePath = profileDataOptions.resumeFile ? profileDataOptions.resumeFile.filename : '';

      profile = await Profile.create({
        userId: user._id,
        type: 'Candidate',
        firstName: profileDataOptions.firstName,
        lastName: profileDataOptions.lastName,
        phone: profileDataOptions.phone || '',
        resume: resumePath,
        skills: [],
        overallScore: 0,
      });
      console.log('✅ Candidate profile created during registration for userId:', user._id);
      if (resumePath) {
        console.log('📄 Resume uploaded:', resumePath);
      }

      // Link profile to user as ObjectID
      user.profile = profile._id;
      await user.save();
      console.log('🔗 Candidate profile linked to user - user.profile:', profile._id);
    }

    // Send OTP
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      const err = new Error('Error sending OTP email');
      err.status = 500;
      throw err;
    }

    console.log('✅ User registered, OTP sent:', email);

    return {
      email,
      username,
      user: user.toObject ? user.toObject() : user,
      profile: profile ? (profile.toObject ? profile.toObject() : profile) : null,
      message: 'Registration successful. Please check your email for OTP code.'
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// OTP verification service
exports.verifyUserOTP = async (email, otp, location = null) => {
  try {
    if (!email || !otp) {
      const err = new Error('Email and OTP are required');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // Helper: log auth attempt
    const logAuthAttempt = async (status) => {
      const authEntry = {
        date: new Date(),
        ip: location?.ip || '',
        localisation: formatLocation(location),
        method: 'OTP',
        status
      };
      await User.updateOne(
        { _id: user._id },
        { $push: { authHistory: authEntry } }
      );
    };

    // Check if banned
    if (user.isBanned) {
      await logAuthAttempt('Failed');
      const err = new Error('User is banned. Please contact support.');
      err.status = 403;
      throw err;
    }

    // Check OTP exists
    if (!user.otp?.code || !user.otp?.expiresAt) {
      await logAuthAttempt('Failed');
      const err = new Error('No OTP found');
      err.status = 400;
      throw err;
    }

    // Check OTP matches
    if (user.otp.code !== otp) {
      await logAuthAttempt('Failed');
      const err = new Error('Invalid OTP code');
      err.status = 401;
      throw err;
    }

    // Check OTP expiry
    if (new Date() > user.otp.expiresAt) {
      await logAuthAttempt('Failed');
      const err = new Error('OTP expired');
      err.status = 401;
      throw err;
    }

    // Update user: verify, clear OTP, update login info
    user.isVerified = true;
    user.otp = undefined;
    user.lastLogin = new Date();
    user.trafficCounter = (user.trafficCounter || 0) + 1;

    if (location) {
      user.ip = location.ip;
      user.Localisation = formatLocation(location);
    }

    await Promise.all([
      user.save(),
      logAuthAttempt('Success')
    ]);

    // Fetch updated user
    const updatedUser = await User.findById(user._id);

    // Fetch profile and companyMembership in parallel if exist
    const [profile, companyMembership] = await Promise.all([
      updatedUser.profile ? Profile.findById(updatedUser.profile) : null,
      updatedUser.companyMembership
        ? require('../models/CompanyMembership.model')
            .findById(updatedUser.companyMembership)
            .populate({
              path: 'company',
              select: 'Localisation createdAt email isVerified lastLogin username updatedAt user_image profile',
              populate: { path: 'profile' }
            })
            .select('_id role updatedAt company')
        : null
    ]);

    console.log('✅ OTP verified successfully for:', email);

    // Generate token with company info if companyMembership exists
    let token;
    if (companyMembership) {
      token = generateToken(updatedUser._id, companyMembership.company._id, updatedUser.role);
    } else {
      token = generateToken(updatedUser._id, null, updatedUser.role);
    }
    return { user: updatedUser, token, profile, companyMembership };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// Service de connexion (login) pour utilisateurs existants
module.exports.loginUser = async (email) => {
  try {
    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error('User not found. Please register first.');
      err.status = 404;
      throw err;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    // Update user with new OTP
    await User.updateOne(
      { _id: user._id },
      {
        otp: {
          code: otp,
          expiresAt: otpExpiry
        }
      }
    );

    // Send OTP
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      const err = new Error('Error sending OTP email');
      err.status = 500;
      throw err;
    }

    console.log('📧 Login OTP sent to:', email);

    return {
      email,
      username: user.username,
      message: 'OTP code sent to your email. Please verify to login.'
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// Service de renvoi d'OTP
module.exports.resendOTP = async (email) => {
  try {
    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error('User not found. Please register first.');
      err.status = 404;
      throw err;
    }

    // Check if user is banned
    if (user.isBanned) {
      const err = new Error('User is banned. Please contact support.');
      err.status = 403;
      throw err;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    // Update user with new OTP
    await User.updateOne(
      { _id: user._id },
      {
        otp: {
          code: otp,
          expiresAt: otpExpiry
        }
      }
    );

    // Send OTP
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      const err = new Error('Error sending OTP email');
      err.status = 500;
      throw err;
    }

    console.log('📧 OTP resent to:', email);

    return {
      email,
      username: user.username,
      message: 'New OTP code has been sent to your email. OTP expires in 5 minutes.'
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.warnUser = async (email) => {
  try {
    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    if (user.isBanned) {
      return {
        message: 'User is already banned',
        user: { _id: user._id, email: user.email, isBanned: true, warnings: user.warnings || 0 }
      };
    }

    // Increment warnings
    const newWarnings = (user.warnings || 0) + 1;
    let updateData = { warnings: newWarnings };

    // Ban if 3 warnings reached
    if (newWarnings >= 3) {
      updateData.isBanned = true;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    ).lean().select('_id email warnings isBanned');

    const message = newWarnings >= 3
      ? 'User has been banned after receiving 3 warnings'
      : `User has received warning ${newWarnings}/3`;

    console.log(`⚠️ Warning issued to ${email}: ${newWarnings}/3`);

    return {
      message,
      user: updatedUser
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

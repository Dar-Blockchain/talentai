const User = require("../../models/UserModel");
const Profile = require("../../models/ProfileModel");
const { sendOTP } = require("../../utils/mailing");
const { generateOTP } = require("../../utils/Onetimepassword");
const { generateToken } = require("../../utils/generateToken");
const { getGmailByToken } = require("../../utils/getGmailByToken");
const { extractUsernameFromEmail, formatLocation } = require("../../helpers/authValidationHelpers");

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Service d'inscription
module.exports.registerUser = async (email) => {
  try {
    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    const username = extractUsernameFromEmail(email);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    // Check if user exists (using .lean() for read-only)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
      .lean()
      .select('_id username otp');

    if (existingUser) {
      // Update existing user's OTP
      await User.updateOne(
        { _id: existingUser._id },
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

      console.log('📧 OTP re-sent for existing user:', email);

      return {
        email,
        username: existingUser.username,
        message: 'New OTP code sent to your email'
      };
    }

    // Create new user
    const user = new User({
      username,
      email,
      otp: {
        code: otp,
        expiresAt: otpExpiry
      }
    });

    await user.save();

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
      message: 'Registration successful. Please check your email for OTP code.'
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// Service de vérification OTP
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

    // Fetch updated user without Hedera sensitive fields
    const updatedUser = await User.findById(user._id).select('-hederaAccountId -hederaPrivateKey -hederaPublicKey');

    // Fetch profile and companyMembership in parallel if exist
    const [profile, companyMembership] = await Promise.all([
      updatedUser.profile ? Profile.findById(updatedUser.profile) : null,
      updatedUser.companyMembership
        ? require('../../models/CompanyMembershipModel')
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
      token = generateToken(updatedUser._id, companyMembership.company._id, companyMembership.role);
    } else {
      token = generateToken(updatedUser._id);
    }
    return { user: updatedUser, token, profile, companyMembership };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// Service de connexion avec Gmail
module.exports.connectWithGmail = async (id_token) => {
  try {
    if (!id_token || typeof id_token !== 'string') {
      const err = new Error('ID token is required');
      err.status = 400;
      throw err;
    }

    const email = getGmailByToken(id_token);

    if (!email) {
      const err = new Error('Could not extract email from token');
      err.status = 400;
      throw err;
    }

    // Find or create user
    let user = await User.findOne({ email }).lean().select('_id isBanned isVerified lastLogin trafficCounter');

    if (user?.isBanned) {
      const err = new Error('User is banned. Please contact support.');
      err.status = 403;
      throw err;
    }

    if (!user) {
      // Create new user
      const username = extractUsernameFromEmail(email);
      const newUser = new User({
        username,
        email,
        isVerified: true,
        trafficCounter: 1,
        lastLogin: new Date()
      });

      await newUser.save();
      user = newUser;
      console.log('✅ New user created via Gmail:', email);
    } else {
      // Update existing user
      await User.updateOne(
        { _id: user._id },
        {
          lastLogin: new Date(),
          $inc: { trafficCounter: 1 }
        }
      );
      console.log('✅ User logged in via Gmail:', email);
    }

    const token = generateToken(user._id);

    return {
      user,
      token,
      message: user.isVerified ? 'Login successful' : 'Account created successfully'
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.GetGmailByToken = async (id_token) => {
  try {
    if (!id_token || typeof id_token !== 'string') {
      const err = new Error('ID token is required');
      err.status = 400;
      throw err;
    }

    const email = getGmailByToken(id_token);

    if (!email) {
      const err = new Error('Could not extract email from token');
      err.status = 400;
      throw err;
    }

    return email;
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

const authService = require("../services/authentication.service");
const {
  validateEmail,
  validateOTPInput,
  validateIdToken,
} = require("../helpers/auth-validation.helpers");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("Auth error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res
    .status(status)
    .json({ success: false, error: error?.message || "Internal error" });
};

// Route d'inscription
module.exports.register = async (req, res) => {
  try {
    const { email, roleType, firstName, lastName, name, companyDetails, phone } = req.body;
    const resumeFile = req.file; // Get uploaded file if exists

    // Validate email
    const validEmail = email;

    // Validate roleType
    const validRoleType = roleType && ['Candidate', 'Company'].includes(roleType) ? roleType : 'Candidate';

    // Validate based on roleType
    if (validRoleType === 'Candidate') {
      // firstName and lastName are REQUIRED for Candidate
      if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'firstName is required and must be a valid string'
        });
      }

      if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'lastName is required and must be a valid string'
        });
      }

      // phone is optional but must be string if provided
      if (phone && typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'phone must be a valid string'
        });
      }
    } else if (validRoleType === 'Company') {
      if (name && typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'name must be a valid string for company profile'
        });
      }
    }

    const result = await authService.registerUser(
      validEmail,
      validRoleType,
      { firstName, lastName, name, companyDetails, phone, resumeFile }
    );

    res.status(201).json({
      success: true,
      message: result.message,
      email: result.email,
      username: result.username,
      user: result.user || null,
      profile: result.profile || null,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Route de connexion (login) pour utilisateurs existants
module.exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const validEmail = validateEmail(email);

    const result = await authService.loginUser(validEmail);

    res.status(200).json({
      success: true,
      message: result.message,
      email: result.email,
      username: result.username,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Vérification OTP
module.exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, location } = req.body;

    // Validate input
    const { email: validEmail, otp: validOTP } = validateOTPInput(email, otp);

    const result = await authService.verifyUserOTP(
      validEmail,
      validOTP,
      location,
    );

    res.cookie("jwt_token", result.token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Email vérifié avec succès",
      user: result.user,
      token: result.token,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Connexion avec Gmail
module.exports.connectWithGmail = async (req, res) => {
  try {
    const { id_token } = req.body;

    // Validate token
    const validToken = validateIdToken(id_token);

    const result = await authService.connectWithGmail(validToken);

    res.cookie("jwt_token", result.token, {
      httpOnly: false,
      maxAge: 5 * 365 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Route de déconnexion
module.exports.logout = (req, res) => {
  try {
    res.clearCookie("jwt_token");

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res
            .status(500)
            .json({ success: false, error: "Logout failed" });
        }
        res.status(200).json({ success: true, message: "Déconnexion réussie" });
      });
    } else {
      res.status(200).json({ success: true, message: "Déconnexion réussie" });
    }
  } catch (error) {
    handleError(res, error, 500);
  }
};

module.exports.warnUser = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    const result = await authService.warnUser(req.user.email);

    res.status(200).json({
      success: true,
      message: result.message,
      user: result.user,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

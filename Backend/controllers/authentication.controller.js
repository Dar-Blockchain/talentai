const authService = require("../services/authentication.service");
const CVAnalysisService = require("../services/cvAnalysis.service");
const Profile = require("../models/Profile.model");
const User = require("../models/User.model");
const {
  validateEmail,
  validateOTPInput,
  validateIdToken,
} = require("../helpers/auth-validation.helpers");
const fs = require('fs');
const path = require('path');
const { analyzeCV } = require("../services/analyseResume.service");

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
  const resumeFile = req.file; // Get uploaded file if exists

  try {
    const { email, roleType, firstName, lastName, name, companyDetails, phone } = req.body;

    // Validate email
    const validEmail = validateEmail(email);

    // Validate roleType
    const validRoleType = roleType && ['Candidate', 'Company', 'Member'].includes(roleType) ? roleType : 'Candidate';

    const result = await authService.registerUser(
      validEmail,
      validRoleType,
      { firstName, lastName, name, companyDetails, phone, resumeFile }
    );

    // Analyze and save CV to CVAnalysis if resume file is provided and user is Candidate
    let cvAnalysisData = null;
    if (resumeFile && resumeFile.path && validRoleType === 'Candidate' && result.user) {
      try {
        // Check if file still exists
        if (fs.existsSync(resumeFile.path)) {
          console.log('📄 Analyzing CV from file:', resumeFile.path);

          // Analyze the CV
          const analyzedCV = await analyzeCV(resumeFile.path);
          const cvData = JSON.parse(analyzedCV);

          // Prepare CV Analysis data
          const cvAnalysisPayload = {
            name: cvData.name || firstName + ' ' + lastName || 'Unknown',
            email: validEmail,
            phone: cvData.phone || phone || '',
            location: cvData.location || '',
            title: cvData.title || '',
            summary: cvData.summary || '',
            yearsOfExperience: cvData.yearsOfExperience || 0,
            seniority: cvData.seniority || 'Entry-Level',
            skills: cvData.skills || [],
            softSkills: cvData.softSkills || [],
            spokenLanguages: cvData.spokenLanguages || [],
            experience: cvData.experience || [],
            education: cvData.education || [],
            certifications: cvData.certifications || [],
            projects: cvData.projects || [],
            links: cvData.links || { linkedin: '', github: '', portfolio: '' },
            User: result.user._id,
            sourceUrl: resumeFile.path,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          };

          // Save to CVAnalysis with profileId to ensure soft skills and languages are added to profile
          const saveCVResult = await CVAnalysisService.createCVAnalysis(
            cvAnalysisPayload,
            result.profile ? result.profile._id : null
          );
          cvAnalysisData = saveCVResult.data;

          console.log('✅ CV Analysis saved during registration:', cvAnalysisData._id);

          // Prepare data to update in Profile
          const profileUpdateData = {};

          // Add skills from CV to Profile with Levelconfirmed = 0
          if (cvData.skills && cvData.skills.length > 0) {
            try {
              const skillsFromCV = cvData.skills.map((skillName) => ({
                name: skillName,
                proficiencyLevel: 0,
                experienceLevel: '',
                NumberTestPassed: 0,
                ScoreTest: 0,
                Levelconfirmed: 0,
              }));

              profileUpdateData.$push = {
                skills: {
                  $each: skillsFromCV,
                },
              };

              console.log(`✅ ${skillsFromCV.length} skills from CV prepared for profile`);
            } catch (skillError) {
              console.warn('⚠️ Error preparing skills:', skillError.message);
            }
          }

          // Add spoken languages from CV to Profile
          if (cvData.spokenLanguages && cvData.spokenLanguages.length > 0) {
            try {
              if (!profileUpdateData.$push) {
                profileUpdateData.$push = {};
              }

              profileUpdateData.$push.spokenLanguages = {
                $each: cvData.spokenLanguages,
              };

              console.log(`✅ ${cvData.spokenLanguages.length} languages from CV prepared for profile`);
            } catch (languageError) {
              console.warn('⚠️ Error preparing languages:', languageError.message);
            }
          }

          // Add contact information from CV to Profile
          if (cvData.email || cvData.links || cvData.location) {
            try {
              const contactInfo = {
                email: cvData.email || '',
                address: '',
                linkedinUrl: cvData.links?.linkedin || '',
                githubUrl: cvData.links?.github || '',
                personalWebsite: cvData.links?.portfolio || '',
                location: cvData.location || '',
              };

              profileUpdateData.$set = {
                ...profileUpdateData.$set,
                contactInformation: contactInfo,
                // Add personal information from CV
                phone: cvData.phone || phone || '',
                educationLevel: cvData.educationLevel || '',
                age: cvData.age || '',
                country: cvData.country || '',
                timeZone: cvData.timeZone || '',
              };

              console.log('✅ Contact information and personal details from CV prepared for profile');
            } catch (contactError) {
              console.warn('⚠️ Error preparing contact information:', contactError.message);
            }
          }

          // Update profile with skills and contact information
          if (result.profile && (profileUpdateData.$push || profileUpdateData.$set)) {
            try {
              await Profile.findByIdAndUpdate(
                result.profile._id,
                profileUpdateData,
                { new: true, runValidators: true }
              );

              console.log('✅ Profile updated with CV data (skills, contact info, and personal details)');
            } catch (profileError) {
              console.warn('⚠️ Failed to update profile with CV data:', profileError.message);
              // Continue even if profile update fails
            }
          }
        }
      } catch (cvError) {
        console.warn('⚠️ CV analysis during registration failed, but user was created:', cvError.message);
        // Continue even if CV analysis fails - user is already created
      }
    }

    res.status(201).json({
      success: true,
      message: result.message,
      email: result.email,
      username: result.username,
      user: result.user || null,
      profile: result.profile || null,
      cvAnalysis: cvAnalysisData ? {
        id: cvAnalysisData._id,
        analysisScore: cvAnalysisData.analysisScore,
        seniority: cvAnalysisData.seniority,
        skillsCount: cvAnalysisData.skills.length,
        softSkillsCount: cvAnalysisData.softSkills.length,
        createdAt: cvAnalysisData.createdAt,
      } : null,
    });
  } catch (error) {
    // Delete the uploaded file if registration fails
    if (resumeFile && resumeFile.path) {
      fs.unlink(resumeFile.path, (err) => {
        if (err) {
          console.error('Error deleting resume file after failed registration:', err);
        } else {
          console.log('📁 Resume file deleted after failed registration:', resumeFile.filename);
        }
      });
    }
    handleError(res, error, 400);
  }
};

// User login (login) for existing users
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

// OTP Verification
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
      message: "Email verified successfully",
      user: result.user,
      token: result.token,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// Renvoi d'OTP
module.exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    const validEmail = validateEmail(email);

    const result = await authService.resendOTP(validEmail);

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

// Logout route
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
        res.status(200).json({ success: true, message: "Logout successful" });
      });
    } else {
      res.status(200).json({ success: true, message: "Logout successful" });
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

module.exports.parseCV = async (req, res) => {
  try {
    // Get the file path from request body or query parameter
    const { filePath, saveToDatabase = true } = req.body || req.query;

    // Validate that filePath is provided
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'filePath is required in request body or query parameter'
      });
    }

    // Validate that file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: `CV file not found at path: ${filePath}`
      });
    }

    // Analyze the CV
    const result = await analyzeCV(filePath);
    const cvData = JSON.parse(result);

    // Save to CVAnalysis database if needed
    let dbRecord = null;
    if (saveToDatabase) {
      try {
        const cvAnalysisData = {
          name: cvData.name || 'Unknown',
          email: cvData.email || '',
          phone: cvData.phone || '',
          location: cvData.location || '',
          title: cvData.title || '',
          summary: cvData.summary || '',
          yearsOfExperience: cvData.yearsOfExperience || 0,
          seniority: cvData.seniority || 'Entry-Level',
          skills: cvData.skills || [],
          softSkills: cvData.softSkills || [],
          spokenLanguages: cvData.spokenLanguages || [],
          experience: cvData.experience || [],
          education: cvData.education || [],
          certifications: cvData.certifications || [],
          projects: cvData.projects || [],
          links: cvData.links || { linkedin: '', github: '', portfolio: '' },
          sourceUrl: filePath,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        };

        // Add user reference if authenticated
        if (req.user) {
          cvAnalysisData.User = req.user._id;
        }

        // Try to get profile ID if user is authenticated and has profile
        let profileIdForUpdate = null;
        if (req.user && req.user._id) {
          try {
            const userProfile = await Profile.findOne({ userId: req.user._id });
            profileIdForUpdate = userProfile ? userProfile._id : null;
          } catch (profileFetchError) {
            console.warn('⚠️ Could not fetch user profile:', profileFetchError.message);
          }
        }

        const saveResult = await CVAnalysisService.createCVAnalysis(
          cvAnalysisData,
          profileIdForUpdate
        );
        dbRecord = saveResult.data;

        console.log('✅ CV Analysis saved to database:', dbRecord._id);
      } catch (dbError) {
        console.warn('⚠️ CV analysis saved but database storage failed:', dbError.message);
        // Continue even if saving to database fails
      }
    }

    res.status(200).json({
      success: true,
      data: cvData,
      databaseRecord: dbRecord ? {
        id: dbRecord._id,
        analysisScore: dbRecord.analysisScore,
        createdAt: dbRecord.createdAt
      } : null,
      message: dbRecord ? 'CV analyzed and saved to database successfully' : 'CV analyzed successfully'
    });
  } catch (error) {
    console.error('Error parsing CV:', error);

    // Handle region/country restriction errors
    if (error?.message?.includes('not allowed from unsupported countries') ||
        error?.message?.includes('Anthropic') ||
        error?.message?.includes('AccessDenied')) {
      return res.status(403).json({
        success: false,
        error: 'CV analysis service (Claude/Anthropic) is not available in your region. Please contact support for alternative solutions.'
      });
    }

    handleError(res, error, 400);
  }
}

// Check role by email — public endpoint used by the job application modal
module.exports.checkRole = async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email }).select("role").lean();
    if (!user) return res.status(404).json({ role: null, exists: false });

    res.json({ role: user.role, exists: true });
  } catch (error) {
    handleError(res, error);
  }
};

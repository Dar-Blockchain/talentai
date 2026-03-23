const CompanyInvitationService = require("../../services/ProfileService/CompanyInvitation.service");
const authService = require("../../services/authentication.service");
const { generateToken } = require("../../utils/generate-token");

module.exports.sentInvitation = async (req, res) => {
  try {
    const { email, role, departmentId } = req.body;
    const invitedBy = req.user._id;
    const username = req.user.username;
    const member = await CompanyInvitationService.sentInvitation(
      invitedBy,
      email,
      role,
      invitedBy,
      username,
      departmentId,
    );
    res.json({ success: true, member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { departmentId } = req.body;
    const updated =
      await CompanyInvitationService.resendInvitation(invitationId, departmentId);
    res.json({ success: true, updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.deleteInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const deleted =
      await CompanyInvitationService.deleteInvitation(invitationId);
    res.json({ success: true, deleted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.respondInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { action, token, firstName, lastName } = req.body;
    
    if (!action || !["accept", "reject"].includes(action))
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });

    if (action === "accept") {
      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "Token is required for accepting invitation" });
      }

      // Get invitation details to retrieve email
      const invitation = await CompanyInvitationService.getInvitationDetails(invitationId);
      if (!invitation) {
        return res
          .status(404)
          .json({ success: false, message: "Invitation not found" });
      }

      const invitationEmail = invitation.email;
      let userId;
      let userEmail;
      let jwtToken;

      // Check if user already exists
      const User = require("../../models/User.model");
      const existingUser = await User.findOne({ email: invitationEmail });

      if (existingUser) {
        // User already exists - use their credentials
        userId = existingUser._id;
        userEmail = existingUser.email;
        // Generate token for existing user
        jwtToken = generateToken(existingUser);
      } else {
        // User doesn't exist - create new account with roleType 'Employee'
        if (!firstName || !lastName) {
          return res
            .status(400)
            .json({ success: false, message: "firstName and lastName are required for new user accounts" });
        }

        try {
          const newUserData = await authService.registerUser(
            invitationEmail,
            'Employee',
            { firstName, lastName }
          );

          userId = newUserData.user._id;
          userEmail = newUserData.user.email;

          // Generate JWT token for new user after account creation
          jwtToken = generateToken(newUserData.user);

          console.log(`✅ New employee account created for ${invitationEmail} (${firstName} ${lastName})`);
        } catch (registrationError) {
          return res
            .status(400)
            .json({ 
              success: false, 
              message: `Failed to create user account: ${registrationError.message}` 
            });
        }
      }

      // Accept invitation and create company membership
      const accepted = await CompanyInvitationService.acceptInvitation(
        invitationId,
        userId,
        userEmail,
        token
      );

      // Get full user data and profile
      const fullUser = await User.findById(userId);
      const Profile = require("../../models/Profile.model");
      const userProfile = await Profile.findOne({ userId });

      res.cookie("jwt_token", jwtToken, {
        httpOnly: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ 
        success: true, 
        message: "Invitation accepted successfully",
        user: fullUser,
        token: jwtToken,
        profile: userProfile || null,
        companyMembership: accepted || null
      });
    }

    const rejected =
      await CompanyInvitationService.rejectInvitation(invitationId);
    return res.json({ success: true, rejected });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.getCompanyInvitations = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const invitations =
      await CompanyInvitationService.getCompanyInvitations(ownerId);
    res.json({ success: true, invitations });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.getInvitationDetails = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const invitation =
      await CompanyInvitationService.getInvitationDetails(invitationId);
    res.json({ success: true, invitation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

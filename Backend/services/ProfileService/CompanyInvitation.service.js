const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/User.model");
const CompanyMembershipModel = require("../../models/CompanyMembership.model");
const CompanyInvitationModel = require("../../models/CompanyInvitation.model");
const { sendCompanyInvitation } = require("../../utils/email-service");

// Constants
const INVITATION_EXPIRATION_TIME = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
const INVITATION_EXPIRATION_SECONDS = 2 * 24 * 60 * 60; // 2 days in seconds for JWT
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || "https://app.talentai.bid";
const JWT_SECRET = process.env.INVITATION_JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Generate a JWT token and calculate expiration date
 * @param {string} userEmail - The user's email
 * @param {string} role - The role being offered
 * @returns {Object} { token: string, expiresAt: Date }
 */
const _generateTokenAndExpiration = (userEmail, role) => {
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRATION_TIME);
  const token = jwt.sign(
    {
      userEmail,
      role,
      type: "company-invitation",
    },
    JWT_SECRET,
    {
      expiresIn: INVITATION_EXPIRATION_SECONDS,
    }
  );
  return {
    token,
    expiresAt,
  };
};

/**
 * Build the invitation acceptance link
 * @param {string} token - The invitation token
 * @param {string} invitationId - The invitation ID
 * @param {string} company - The company ID
 * @returns {string} The complete invitation URL
 */
const _buildInvitationLink = (token, invitationId, company) =>
  `${FRONTEND_BASE_URL}/invitation/joinTeam/?token=${token}&invitationId=${invitationId}&company=${company}`;

/**
 * Send invitation email with error handling
 * @param {string} email - Recipient email
 * @param {string} senderName - Name of the person sending the invitation
 * @param {string} role - Role being offered
 * @param {string} invitationLink - The invitation link
 * @param {boolean} isResend - Whether this is a resend
 */
const _sendInvitationEmail = async (email, senderName, role, invitationLink, isResend = false) => {
  try {
    await sendCompanyInvitation(email, senderName, role, senderName, invitationLink);
    if (isResend) {
      console.log(`✅ Invitation resent to ${email}`);
    }
  } catch (error) {
    console.error(`Failed to send ${isResend ? "resend" : "company"} invitation email:`, error);
  }
};

/**
 * Add department to data object if provided
 * @param {Object} data - The data object to update
 * @param {string|null} departmentId - The department ID
 */
const _addDepartmentIfProvided = (data, departmentId) => {
  if (departmentId) {
    data.department = departmentId;
  }
};

/**
 * Verify and decode a JWT invitation token
 * @param {string} token - The JWT token
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const _verifyAndDecodeToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Invitation token has expired");
    }
    throw new Error("Invalid invitation token");
  }
};

/**
 * Send an invitation to a user to join a company account
 * @param {string} company - Company ID
 * @param {string} userEmail - Email of the user to invite
 * @param {string} role - Role to assign
 * @param {string} invitedBy - User ID of the person sending invitation
 * @param {string} username - Username of the inviting person
 * @param {string|null} departmentId - Optional department ID
 * @returns {Object} The created invitation document
 */
module.exports.sentInvitation = async (
  company,
  userEmail,
  role,
  invitedBy,
  username,
  departmentId = null,
) => {
  const existing = await CompanyInvitationModel.findOne({
    email: userEmail,
    company,
    status: "pending",
  });
  if (existing) {
    throw new Error("User already has a pending invitation for this account");
  }

  const { token, expiresAt } = _generateTokenAndExpiration(userEmail, role);

  const invitationData = {
    email: userEmail,
    company,
    role,
    invitedBy,
    token,
    expiresAt,
  };

  _addDepartmentIfProvided(invitationData, departmentId);

  const member = await CompanyInvitationModel.create(invitationData);
  const invitationLink = _buildInvitationLink(token, member._id, company);

  await _sendInvitationEmail(userEmail, username, role, invitationLink);

  return member;
};

/**
 * Resend an invitation with a new token and expiration
 * @param {string} invitationId - The invitation ID to resend
 * @param {string|null} departmentId - Optional updated department ID
 * @returns {Object} The updated invitation document
 */
module.exports.resendInvitation = async (invitationId, departmentId = null) => {
  const updated = await CompanyInvitationModel.findById(invitationId).populate("invitedBy");
  if (!updated) {
    throw new Error("Invitation not found");
  }

  const { token, expiresAt } = _generateTokenAndExpiration(updated.email, updated.role);

  const updateData = { token, expiresAt, status: "pending" };

  _addDepartmentIfProvided(updateData, departmentId);

  const updatedInvitation = await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    updateData,
    { new: true },
  ).populate("invitedBy");

  const invitationLink = _buildInvitationLink(token, invitationId, updatedInvitation.company);
  const senderName = updatedInvitation.invitedBy?.username || "Admin";

  await _sendInvitationEmail(updatedInvitation.email, senderName, updatedInvitation.role, invitationLink, true);

  return updatedInvitation;
};

/**
 * Delete/revoke an invitation
 * @param {string} invitationId - The invitation ID to delete
 * @returns {Object} The deleted invitation document
 */
module.exports.deleteInvitation = async (invitationId) => {
  const deleted = await CompanyInvitationModel.findByIdAndDelete(invitationId);
  if (!deleted) {
    throw new Error("Invitation not found");
  }
  return deleted;
};

/**
 * Accept an invitation and add the user to the company
 * @param {string} invitationId - The invitation ID
 * @param {string} userId - The user ID accepting the invitation
 * @param {string} userEmail - The user's email
 * @param {string} token - The JWT invitation token
 * @returns {Object} The created company membership
 */
module.exports.acceptInvitation = async (invitationId, userId, userEmail, token) => {
  const invitation = await CompanyInvitationModel.findById(invitationId);
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Verify JWT token validity and expiration
  let decodedToken;
  try {
    decodedToken = _verifyAndDecodeToken(token);
  } catch (error) {
    throw error;
  }

  // Verify token payload matches invitation data
  if (decodedToken.userEmail !== userEmail) {
    throw new Error("Invitation not for this user");
  }

  if (decodedToken.userEmail !== invitation.email) {
    throw new Error("Token email does not match invitation email");
  }

  if (decodedToken.role !== invitation.role) {
    throw new Error("Token role does not match invitation role");
  }

  const membershipData = {
    user: userId,
    company: invitation.company,
    role: invitation.role,
  };

  _addDepartmentIfProvided(membershipData, invitation.department);

  const membership = await CompanyMembershipModel.create(membershipData);

  await CompanyInvitationModel.findByIdAndDelete(invitationId);

  await User.findByIdAndUpdate(
    userId,
    { companyMembership: membership._id },
    { new: true },
  );

  return membership;
};

/**
 * Reject an invitation
 * @param {string} invitationId - The invitation ID to reject
 * @returns {Object} The updated invitation document
 */
module.exports.rejectInvitation = async (invitationId) => {
  const updated = await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { status: "revoked" },
    { new: true },
  );
  if (!updated) {
    throw new Error("Invitation not found");
  }
  return updated;
};

/**
 * Get all invitations for companies owned by the current user
 * @param {Array} ownerId - Array of company IDs
 * @returns {Array} Array of invitation documents
 */
module.exports.getCompanyInvitations = async (ownerId) => {
  return CompanyInvitationModel.find({ company: { $in: ownerId } })
    .populate("invitedBy")
    .sort({ createdAt: -1 });
};

/**
 * Get invitation statistics for a company
 * @param {string} companyId - The company ID
 * @returns {Object} Statistics object with total count
 */
module.exports.getInvitationStatsByCompany = async (companyId) => {
  const total = await CompanyInvitationModel.countDocuments({ company: companyId });
  return { total };
};

// Get invitation details by invitation ID
module.exports.getInvitationDetails = async (invitationId) => {
  const invitation = await CompanyInvitationModel.findById(invitationId)
    .populate({
      path: "invitedBy",
      select: "email role username profile",
      populate: {
        path: "profile",
        select: "companyDetails.name"
      }
    });

  if (!invitation) throw new Error("Invitation not found");
  
  // Convert to plain object to ensure clean transformation
  const invitationObj = invitation.toObject();
  
  // Transform invitedBy to keep only required fields
  if (invitationObj.invitedBy) {
    const companyName = invitationObj.invitedBy.profile?.companyDetails?.name || "";
    invitationObj.invitedBy = {
      username: invitationObj.invitedBy.username,
      email: invitationObj.invitedBy.email,
      role: invitationObj.invitedBy.role,
      name: companyName
    };
  }

  return invitationObj;
};

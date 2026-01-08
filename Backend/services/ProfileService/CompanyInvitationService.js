const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../../models/UserModel");
const CompanyMembershipModel = require("../../models/CompanyMembershipModel");
const CompanyInvitationModel = require("../../models/CompanyInvitationModel");
const { sendCompanyInvitation } = require("../../utils/mailing");

// Send an invitation to a user to join a company account
module.exports.sentInvitation = async (Company, userEmail, role, invitedBy, username) => {

  const existing = await CompanyInvitationModel.findOne({ email: userEmail, Company, status: "pending" });
  if (existing) throw new Error("User already has a pending invitation for this account");

  // Generate a unique token and set expiration to 2 days
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

  const member = await CompanyInvitationModel.create({ 
    email: userEmail, 
    Company, 
    role, 
    invitedBy, 
    token, 
    expiresAt 
  });

  // Build the acceptance link (frontend)
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${frontendBase}/invitation/joinTeam/?token=${token}&invitationId=${member._id}&Company=${Company}`;

  // Send the invitation email
  try {
    await sendCompanyInvitation(userEmail, username, role, userEmail, invitationLink);
  } catch (e) {
    console.error('Failed to send company invitation email:', e);
  }

  return member;
};

// Remove an employee from a company account
module.exports.removeEmployee = async (OrganizationId, userId) => {
  // Find and delete the CompanyMembershipModel
  const member = await CompanyMembershipModel.findOneAndDelete({ Organization: OrganizationId, user: userId });
  if (!member) throw new Error("Member not found");

  // If the user has no other CompanyMembershipModel entries, clear their Organization field
  const remaining = await CompanyMembershipModel.findOne({ user: userId });
  if (!remaining) {
    await User.findByIdAndUpdate(userId, { Organization: null }, { new: true });
  }

  return member;
};

// Resend an invitation (regenerate token and reset expiration)
module.exports.resendInvitation = async (invitationId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

  const updated = await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { token, expiresAt, status: "pending" },
    { new: true }
  ).populate("invitedBy");

  if (!updated) throw new Error("Invitation not found");

  // Build the acceptance link with the new token
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${frontendBase}/invitation/joinTeam/?token=${token}&invitationId=${invitationId}&Company=${Company}`;

  // Resend the invitation email with the new token
  try {
    const invitedByName = updated.invitedBy?.username || "Admin";
    await sendCompanyInvitation(updated.email, invitedByName, updated.role, invitedByName, invitationLink);
    console.log(`✅ Invitation resent to ${updated.email}`);
  } catch (e) {
    console.error('Failed to resend company invitation email:', e);
  }

  return updated;
};

// Delete/revoke an invitation
module.exports.deleteInvitation = async (invitationId) => {
  const deleted = await CompanyInvitationModel.findByIdAndDelete(invitationId);
  if (!deleted) throw new Error("Invitation not found");
  return deleted;
};

// Accept an invitation and add the user to the company
module.exports.acceptInvitation = async (invitationId, userId, userEmail) => {
  const invitation = await CompanyInvitationModel.findById(invitationId);
  if (!invitation) throw new Error("Invitation not found");
  
  // Verify that the invitation has not expired
  if (new Date() > invitation.expiresAt) throw new Error("Invitation has expired");
  
  // Verify that the invitation email matches the user's email
  if (invitation.email !== userEmail) throw new Error("Invitation not for this user");

  // Create the CompanyMembership entry
  const membership = await CompanyMembershipModel.create({
    user: userId,
    Organization: invitation.Company,
    role: invitation.role,
  });

  // Update the invitation status
  await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { status: "active" },
    { new: true }
  );

  // Update the Company field of the user
  await User.findByIdAndUpdate(userId, { Organization: invitation.Company }, { new: true });

  return membership;
};

// Reject an invitation
module.exports.rejectInvitation = async (invitationId) => {
  const updated = await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { status: "revoked" },
    { new: true }
  );
  if (!updated) throw new Error("Invitation not found");
  return updated;
};

// Get all invitations for companies owned by the current user
module.exports.getCompanyInvitations = async (ownerId) => { 
  // Fetch all invitations for these companies
  return CompanyInvitationModel.find({ Company: { $in: ownerId } })
    .populate("invitedBy")
    .sort({ createdAt: -1 });
};

// Get invitation details by invitation ID
module.exports.getInvitationDetails = async (invitationId) => {
  const invitation = await CompanyInvitationModel.findById(invitationId)
    .populate("Company")
    .populate("invitedBy");
  
  if (!invitation) throw new Error("Invitation not found");
  return invitation;
};

const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../../models/UserModel");
const CompanyMembershipModel = require("../../models/CompanyMembershipModel");
const CompanyInvitationModel = require("../../models/CompanyInvitationModel");
const { sendCompanyInvitation } = require("../../utils/mailing");

// Ajouter un employé à un compte
module.exports.sentInvitation = async (Company, userEmail, role, invitedBy, username) => {

  const existing = await CompanyInvitationModel.findOne({ email: userEmail, Company, status: "pending" });
  if (existing) throw new Error("User already has a pending invitation for this account");

  // Générer un token unique et définir l'expiration à 2 jours
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 jours

  const member = await CompanyInvitationModel.create({ 
    email: userEmail, 
    Company, 
    role, 
    invitedBy, 
    token, 
    expiresAt 
  });

  // Construire le lien d'acceptation (frontend)
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${frontendBase}/invitation/joinTeam/?token=${token}&invitationId=${member._id}&Company=${Company}`;

  // envoyer l'email d'invitation
  try {
    await sendCompanyInvitation(userEmail, username, role, userEmail, invitationLink);
  } catch (e) {
    console.error('Failed to send company invitation email:', e);
  }

  return member;
};

// Retirer un employé d'un compte
module.exports.removeEmployee = async (OrganizationId, userId) => {
  // Trouver et supprimer l'CompanyMembershipModel
  const member = await CompanyMembershipModel.findOneAndDelete({ Organization: OrganizationId, user: userId });
  if (!member) throw new Error("Member not found");

  // If the user has no other CompanyMembershipModel entries, clear their Organization field
  const remaining = await CompanyMembershipModel.findOne({ user: userId });
  if (!remaining) {
    await User.findByIdAndUpdate(userId, { Organization: null }, { new: true });
  }

  return member;
};

// Renvoyer une invitation (regénérer token et réinitialiser expiration)
module.exports.resendInvitation = async (invitationId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 jours

  const updated = await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { token, expiresAt, status: "pending" },
    { new: true }
  ).populate("invitedBy");

  if (!updated) throw new Error("Invitation not found");

  // Construire le lien d'acceptation avec le nouveau token
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const invitationLink = `${frontendBase}/invitation/joinTeam/?token=${token}&invitationId=${invitationId}&Company=${Company}`;

  // Renvoyer l'email d'invitation avec le nouveau token
  try {
    const invitedByName = updated.invitedBy?.username || "Admin";
    await sendCompanyInvitation(updated.email, invitedByName, updated.role, invitedByName, invitationLink);
    console.log(`✅ Invitation renvoyée à ${updated.email}`);
  } catch (e) {
    console.error('Failed to resend company invitation email:', e);
  }

  return updated;
};

// Supprimer/révoquer une invitation
module.exports.deleteInvitation = async (invitationId) => {
  const deleted = await CompanyInvitationModel.findByIdAndDelete(invitationId);
  if (!deleted) throw new Error("Invitation not found");
  return deleted;
};

// Accepter une invitation et ajouter l'utilisateur à la compagnie
module.exports.acceptInvitation = async (invitationId, userId, userEmail) => {
  const invitation = await CompanyInvitationModel.findById(invitationId);
  if (!invitation) throw new Error("Invitation not found");
  
  // Vérifier que l'invitation n'a pas expiré
  if (new Date() > invitation.expiresAt) throw new Error("Invitation has expired");
  
  // Vérifier que l'email de l'invitation correspond à celui de l'utilisateur
  if (invitation.email !== userEmail) throw new Error("Invitation not for this user");

  // Créer l'entrée CompanyMembership
  const membership = await CompanyMembershipModel.create({
    user: userId,
    Organization: invitation.Company,
    role: invitation.role,
  });

  // Mettre à jour le statut de l'invitation
  await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { status: "active" },
    { new: true }
  );

  // Mettre à jour le champ Company de l'utilisateur
  await User.findByIdAndUpdate(userId, { Organization: invitation.Company }, { new: true });

  return membership;
};

// Refuser une invitation
module.exports.rejectInvitation = async (invitationId) => {
  const updated = await CompanyInvitationModel.findByIdAndUpdate(
    invitationId,
    { status: "revoked" },
    { new: true }
  );
  if (!updated) throw new Error("Invitation not found");
  return updated;
};

// Récupérer les invitations pour toutes les compagnies dont l'utilisateur est propriétaire
module.exports.getCompanyInvitations = async (ownerId) => { 
  // Récupérer toutes les invitations pour ces compagnies
  return CompanyInvitationModel.find({ Company: { $in: ownerId } })
    .populate("invitedBy")
    .sort({ createdAt: -1 });
};

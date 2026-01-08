const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../../models/UserModel");
const CompanyMembershipModel = require("../../models/CompanyMembershipModel");
const CompanyInvitationModel = require("../../models/CompanyInvitationModel");
const { sendCompanyInvitation } = require("../../utils/mailing");

// Ajouter un employé à un compte
module.exports.sentInvitation = async (Company, userEmail, role, invitedBy, username) => {

  let user = await User.findOne({ email: userEmail });

  if (!user) {
    user = await User.create({ email: userEmail, username: userEmail.split("@")[0], role: "Candidate" });
  }

  const existing = await CompanyInvitationModel.findOne({ user: user._id, Company });
  if (existing) throw new Error("User already has access to this account");

  // Générer un token unique et définir l'expiration à 2 jours
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 jours

  const member = await CompanyInvitationModel.create({ 
    user: user._id, 
    Company, 
    role, 
    invitedBy, 
    token, 
    expiresAt 
  });

  // Construire les liens d'acceptation/refus (frontend)
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const acceptLink = `${frontendBase}/invitation/joinTeam/?token=${token}&invitationId=${member._id}&Company=${Company}&user=${user._id}`;

  // envoyer l'email d'invitation avec les liens
  try {
    await sendCompanyInvitation(userEmail, username, role, userEmail, acceptLink);
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
  );

  if (!updated) throw new Error("Invitation not found");
  return updated;
};

// Supprimer/révoquer une invitation
module.exports.deleteInvitation = async (invitationId) => {
  const deleted = await CompanyInvitationModel.findByIdAndDelete(invitationId);
  if (!deleted) throw new Error("Invitation not found");
  return deleted;
};

// Accepter une invitation et ajouter l'utilisateur à la compagnie
module.exports.acceptInvitation = async (invitationId, userId) => {
  const invitation = await CompanyInvitationModel.findById(invitationId);
  if (!invitation) throw new Error("Invitation not found");
  
  // Vérifier que l'invitation n'a pas expiré
  if (new Date() > invitation.expiresAt) throw new Error("Invitation has expired");
  
  // Vérifier que l'utilisateur est correct
  if (invitation.user.toString() !== userId.toString()) throw new Error("Invitation not for this user");

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
    .populate("user")
    .populate("invitedBy")
    .sort({ createdAt: -1 });
};

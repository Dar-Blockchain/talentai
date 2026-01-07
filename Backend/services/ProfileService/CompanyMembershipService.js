const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../../models/UserModel");
const CompanyMembershipModel = require("../../models/CompanyMembershipModel");
const CompanyInvitationModel = require("../../models/CompanyInvitationModel");
const { sendCompanyInvitation } = require("../../utils/mailing");

// Ajouter un employé à un compte
module.exports.sentInvitation = async (Company, userEmail, role, invitedBy, username) => {

  // envoyer l'email d'invitation
  await sendCompanyInvitation(userEmail, username, role, invitedBy);

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

  // Set the user's Company field to this Company
  //await User.findByIdAndUpdate(user._id, { Company }, { new: true });

  return member;
};

// Lister les employés d'un compte
module.exports.listEmployees = async (accountId) => {
  return CompanyMembershipModel.find({ Organization: accountId }).populate("user", "email username");
};

// Récupérer les employés pour les organisations dont l'utilisateur est propriétaire
module.exports.listMyEmployees = async (ownerId) => {
  // Since we no longer have an Organization collection, find Organization ids where the user is Owner
  const ownerEntries = await CompanyMembershipModel.find({ user: ownerId, role: "Owner" }).select("Organization");
  const orgIds = ownerEntries.map((o) => o.Organization);
  if (orgIds.length === 0) return [];
  return CompanyMembershipModel.find({ Organization: { $in: orgIds } }).populate("user", "email username");
};

// Récupérer une organisation avec ses membres populés
module.exports.getOrganizationWithMembers = async (organizationId) => {
  return CompanyMembershipModel.find({ Organization: organizationId }).populate("user", "email username");
};

// Modifier rôle d'un membre
module.exports.updateRole = async (OrganizationId, userId, newRole) => {
  const member = await CompanyMembershipModel.findOneAndUpdate(
    { Organization: OrganizationId, user: userId },
    { role: newRole },
    { new: true }
  );
  if (!member) throw new Error("Member not found");
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

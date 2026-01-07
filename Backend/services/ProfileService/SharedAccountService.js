const User = require("../../models/UserModel");
const Organization = require("../../models/OrganizationSchema");
const OrganizationMember = require("../../models/OrganizationMemberModel");
const { sendOrganizationInvite } = require("../../utils/mailing");

// Créer un compte Company avec Owner
module.exports.createCompany = async (ownerId, name) => {
  try {
    const account = await Organization.create({ name, type: "Company", owner: ownerId });
    const ownerMember = await OrganizationMember.create({ user: ownerId, Organization: account._id, role: "Owner" });
    // Ajouter le propriétaire dans le tableau members de l'organisation (évite les doublons)
    await Organization.findByIdAndUpdate(account._id, { $addToSet: { members: ownerMember._id } }, { new: true });
    
    await User.findByIdAndUpdate(
      ownerId,
      { Organization: account._id },
      { new: true }
    );

    return account;
  } catch (err) {
    console.error("createCompany error:", err);
    throw new Error("Failed to create company");
  }
};

// Ajouter un employé à un compte
module.exports.addEmployee = async (OrganizationId, userEmail, role, invitedBy,username) => {

      // trouver l'email de l'invitant si possible
      let inviterEmail = null;
      try {
        const inviterUser = await User.findById(invitedBy);
        if (inviterUser) inviterEmail = inviterUser.email;
      } catch (e) {}

      // envoyer l'email d'invitation et sortir en indiquant qu'une invitation a été envoyée
      await sendOrganizationInvite(userEmail, username, role, inviterEmail);
    

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({ email: userEmail, username: userEmail.split("@")[0], role: "Candidate" });
    }

    const existing = await OrganizationMember.findOne({ user: user._id, Organization: OrganizationId });
    if (existing) throw new Error("User already has access to this account");

    const member = await OrganizationMember.create({ user: user._id, Organization: OrganizationId, role, invitedBy });
    
    // Ajouter le membre au tableau members de l'organisation en évitant les doublons
    await Organization.findByIdAndUpdate(
      OrganizationId,
      { $addToSet: { members: member._id } },
      { new: true }
    );

    // Ajouter la relation Organization à l'utilisateur
    await User.findByIdAndUpdate(
      user._id,
      { Organization: OrganizationId },
      { new: true }
    );

    return member;
  };

// Lister les employés d'un compte
module.exports.listEmployees = async (accountId) => {
  return OrganizationMember.find({ Organization: accountId }).populate("user", "email username");
};

// Récupérer les employés pour les organisations dont l'utilisateur est propriétaire
module.exports.listMyEmployees = async (ownerId) => {
  const orgs = await Organization.find({ owner: ownerId }).select("_id");
  const orgIds = orgs.map((o) => o._id);
  if (orgIds.length === 0) return [];
  return OrganizationMember.find({ Organization: { $in: orgIds } }).populate("user", "email username");
};

// Récupérer une organisation avec ses membres populés
module.exports.getOrganizationWithMembers = async (organizationId) => {
  return Organization.findById(organizationId)
    .populate({
      path: "members",
      populate: { path: "user", select: "email username" },
    });
};

// Modifier rôle d'un membre
module.exports.updateRole = async (OrganizationId, userId, newRole) => {
  const member = await OrganizationMember.findOneAndUpdate(
    { Organization: OrganizationId, user: userId },
    { role: newRole },
    { new: true }
  );
  if (!member) throw new Error("Member not found");
  return member;
};

// Retirer un employé d'un compte
module.exports.removeEmployee = async (OrganizationId, userId) => {
  // Trouver et supprimer l'OrganizationMember
  const member = await OrganizationMember.findOneAndDelete({ Organization: OrganizationId, user: userId });
  if (!member) throw new Error("Member not found");

  // Retirer la référence du membre depuis l'organisation
  await Organization.findByIdAndUpdate(OrganizationId, { $pull: { members: member._id } });

  // Optionnel: dissocier l'utilisateur de l'organisation
  await User.findByIdAndUpdate(userId, { Organization: null }, { new: true });

  return member;
};

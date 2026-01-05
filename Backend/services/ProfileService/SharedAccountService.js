const User = require("../../models/UserModel");
const Organization = require("../../models/OrganizationSchema");
const OrganizationMember = require("../../models/OrganizationMemberModel");
const { sendOrganizationInvite } = require("../../utils/mailing");

// Créer un compte Company avec Owner
module.exports.createCompany = async (ownerId, name) => {
  const account = await Organization.create({ name, type: "Company", owner: ownerId });
  const ownerMember = await OrganizationMember.create({ user: ownerId, Organization: account._id, role: "Owner" });
  // Ajouter le propriétaire dans le tableau members de l'organisation (évite les doublons)
  await Organization.findByIdAndUpdate(account._id, { $addToSet: { members: ownerMember._id } }, { new: true });
  return account;
};

// Ajouter un employé à un compte
module.exports.addEmployee = async (accountId, userEmail, role, invitedBy,username) => {

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

    const existing = await OrganizationMember.findOne({ user: user._id, Organization: accountId });
    if (existing) throw new Error("User already has access to this account");

    const member = await OrganizationMember.create({ user: user._id, Organization: accountId, role, invitedBy });
    
    // Ajouter le membre au tableau members de l'organisation en évitant les doublons
    await Organization.findByIdAndUpdate(
      accountId,
      { $addToSet: { members: member._id } },
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
module.exports.updateRole = async (accountId, userId, newRole) => {
  const member = await OrganizationMember.findOneAndUpdate(
    { Organization: accountId, user: userId },
    { role: newRole },
    { new: true }
  );
  if (!member) throw new Error("Member not found");
  return member;
};

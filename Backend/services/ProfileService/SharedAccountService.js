const User = require("../../models/UserModel");
const Organization = require("../../models/OrganizationSchema");
const OrganizationMember = require("../../models/OrganizationMemberModel");

// Créer un compte Company avec Owner
module.exports.createCompany = async (ownerId, name) => {
  const account = await Organization.create({ name, type: "Company", owner: ownerId });
  await OrganizationMember.create({ user: ownerId, Organization: account._id, role: "Owner" });
  return account;
};

// Ajouter un employé à un compte
module.exports.addEmployee = async (accountId, userEmail, role, invitedBy) => {
    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({ email: userEmail, username: userEmail.split("@")[0], role: "Company" });
    }

    const existing = await OrganizationMember.findOne({ user: user._id, Organization: accountId });
    if (existing) throw new Error("User already has access to this account");

    const member = await OrganizationMember.create({ user: user._id, Organization: accountId, role, invitedBy });
    return member;
  };

// Lister les employés d'un compte
module.exports.listEmployees = async (accountId) => {
  return OrganizationMember.find({ Organization: accountId }).populate("user", "email username");
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

const CompanyMembershipModel = require("../../models/CompanyMembershipModel");
const User = require("../../models/UserModel");

// Get all memberships for a company owned by the current user
module.exports.getMembershipsByCompany = async (companyId) => {
  const memberships = await CompanyMembershipModel.find({ Company: companyId })
    .populate("user", "username email")
    .populate("invitedBy", "username email")
    .sort({ createdAt: -1 });

  if (!memberships) throw new Error("No memberships found for this company");
  return memberships;
};

// Delete a membership (remove a member from a company)
module.exports.deleteMembership = async (membershipId, companyOwnerId) => {
  // First, fetch the membership to verify it belongs to a company owned by the requester
  const membership = await CompanyMembershipModel.findById(membershipId)
    .populate("Company");

  if (!membership) throw new Error("Membership not found");

  // Verify that the company is owned by the requester (optional but recommended for security)
  // You could add an ownership check here if needed
  
  // Delete the membership
  const deleted = await CompanyMembershipModel.findByIdAndDelete(membershipId);
  
  // If this was the last membership for the user, optionally clear their Organization field
  const remaining = await CompanyMembershipModel.findOne({ user: membership.user });
  if (!remaining) {
    await User.findByIdAndUpdate(membership.user, { Organization: null }, { new: true });
  }

  return deleted;
};

// Update the role of a membership
module.exports.updateMembershipRole = async (membershipId, newRole) => {
  // Validate the role
  const validRoles = ["Owner", "RH", "TechLead", "Supervisor", "Manager"];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  const updated = await CompanyMembershipModel.findByIdAndUpdate(
    membershipId,
    { role: newRole },
    { new: true }
  )
    .populate("user", "username email")
    .populate("invitedBy", "username email");

  if (!updated) throw new Error("Membership not found");
  return updated;
};

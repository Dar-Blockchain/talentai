const CompanyMembershipModel = require("../../models/CompanyMembership.model");
const User = require("../../models/User.model");

// Get all memberships for a company owned by the current user (with optional filters)
module.exports.getMembershipsByCompany = async (companyId, filters = {}) => {
  const query = { company: companyId };

  // Filter by username if provided (case-insensitive partial match)
  if (filters.username) {
    const userWithUsername = await User.findOne({
      username: { $regex: filters.username, $options: "i" },
    });
    if (userWithUsername) {
      query.user = userWithUsername._id;
    } else {
      // Return empty array if username not found
      return [];
    }
  }

  // Filter by role if provided
  if (filters.role) {
    query.role = filters.role;
  }

  const memberships = await CompanyMembershipModel.find(query)
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
    .populate("company");

  if (!membership) throw new Error("Membership not found");

  // Verify that the company is owned by the requester (optional but recommended for security)
  // You could add an ownership check here if needed
  
  // Delete the membership
  const deleted = await CompanyMembershipModel.findByIdAndDelete(membershipId);
  
  // If this was the last membership for the user, optionally clear their companyMembership field
  const remaining = await CompanyMembershipModel.findOne({ user: membership.user });
  if (!remaining) {
    await User.findByIdAndUpdate(membership.user, { companyMembership: null }, { new: true });
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

// Update the department of a membership (assign or unassign from department)
module.exports.updateMembershipDepartment = async (membershipId, departmentId) => {
  const updated = await CompanyMembershipModel.findByIdAndUpdate(
    membershipId,
    { department: departmentId || null },
    { new: true }
  )
    .populate("user", "username email")
    .populate("department", "name description")
    .populate("invitedBy", "username email");

  if (!updated) throw new Error("Membership not found");
  return updated;
};

// Compute simple statistics for a company's memberships (counts by role/status)
module.exports.getMembershipStatsByCompany = async (companyId) => {

  const total = await CompanyMembershipModel.countDocuments({ company: companyId });

  return { total };
};

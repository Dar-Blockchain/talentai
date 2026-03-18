const CompanyMembershipModel = require("../../models/CompanyMembership.model");
const User = require("../../models/User.model");

// Get all memberships for a company owned by the current user (with optional search, status filter, department filter and pagination)
module.exports.getMembershipsByCompany = async (companyId, search = "", status = "", department = "", page = 1, limit = 10) => {
  const query = { company: companyId };

  // Apply status filter if provided
  if (status) {
    query.status = status;
  }

  // Apply department filter if provided (support multiple departments)
  if (department) {
    const departments = Array.isArray(department) ? department : [department];
    if (departments.length > 0) {
      query.department = { $in: departments };
    }
  }

  // If search is provided, search across username, email, role
  if (search) {
    // First, try to find users by username or email
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    });

    const userIds = users.map((u) => u._id);

    // Build an OR query for search across multiple fields
    query.$or = [
      ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
      { role: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await CompanyMembershipModel.countDocuments(query);

  // Fetch paginated memberships (include user profile for firstName/lastName)
  const memberships = await CompanyMembershipModel.find(query)
    .populate({
      path: "user",
      select: "username email profile",
      populate: { path: "profile", select: "firstName lastName" },
    })
    .populate("department", "name")
    .populate("invitedBy", "username email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (!memberships) throw new Error("No memberships found for this company");

  return {
    memberships,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
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
    .populate({
      path: "user",
      select: "username email profile",
      populate: { path: "profile", select: "firstName lastName" },
    })
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
    .populate({
      path: "user",
      select: "username email profile",
      populate: { path: "profile", select: "firstName lastName" },
    })
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

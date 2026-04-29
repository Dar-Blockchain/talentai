const CompanyMembershipModel = require("../../models/CompanyMembership.model");
const User = require("../../models/User.model");

// Get all memberships for a company owned by the current user (with optional search, role, department filter, sorting and pagination)
module.exports.getMembershipsByCompany = async (
  companyId,
  search = "",
  status = "",
  department = "",
  page = 1,
  limit = 10,
  filters = {}
) => {
  const query = { company: companyId };

  // Apply status filter if provided
  if (status) {
    query.status = status;
  }

  // Apply department filter from parameter or filters object
  const departmentId = filters.departmentId || department;
  if (departmentId) {
    const departments = Array.isArray(departmentId) ? departmentId : [departmentId];
    if (departments.length > 0) {
      query.department = { $in: departments };
    }
  }

  // Apply role filter if provided
  if (filters.role) {
    query.role = filters.role;
  }

  // If search is provided, search across username, email, firstName, lastName, role
  const searchTerm = filters.search || search;
  if (searchTerm) {
    // Find users by username, email, firstName, or lastName
    const users = await User.find({
      $or: [
        { username: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { "profile.firstName": { $regex: searchTerm, $options: "i" } },
        { "profile.lastName": { $regex: searchTerm, $options: "i" } },
      ],
    });

    const userIds = users.map((u) => u._id);

    // Build an OR query for search across multiple fields
    query.$or = [
      ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
      { role: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await CompanyMembershipModel.countDocuments(query);

  // Determine sort order (default: descending by date)
  const sortOrder = filters.order === "asc" ? 1 : -1;
  let sortQuery = { createdAt: sortOrder };

  if (filters.sortBy === "name") {
    // Sort by user name (requires sorting after population)
    sortQuery = { "user.profile.firstName": sortOrder };
  } else if (filters.sortBy === "date") {
    sortQuery = { createdAt: sortOrder };
  }

  // Fetch paginated memberships (include user profile for firstName/lastName)
  let query_builder = CompanyMembershipModel.find(query)
    .populate({
      path: "user",
      select: "username email profile",
      populate: { path: "profile", select: "firstName lastName" },
    })
    .populate("department", "name")
    .populate("invitedBy", "username email");

  // Apply sort - note: sorting by name requires sorting after population due to nested field
  if (filters.sortBy === "name") {
    const allMemberships = await query_builder.sort(sortQuery);
    const sortedAndPaginated = allMemberships.slice(skip, skip + limit);
    return {
      memberships: sortedAndPaginated,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // For date sorting, sort before pagination
  const memberships = await query_builder
    .sort(sortQuery)
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

// Delete a membership and completely remove the user from the system
module.exports.deleteMembership = async (membershipId, companyOwnerId) => {
  // First, fetch the membership to verify it exists
  const membership = await CompanyMembershipModel.findById(membershipId)
    .populate("company");

  if (!membership) throw new Error("Membership not found");

  const userId = membership.user;

  try {
    // Get all models that might reference this user
    const EmployeePermissionsModel = require("../../models/EmployeePermissions.model");
    const ProfileModel = require("../../models/Profile.model");
    const CVAnalysisModel = require("../../models/CvAnalysis.model");
    const CompanyInvitationModel = require("../../models/CompanyInvitation.model");

    // 1. Delete all employee permissions for this user
    await EmployeePermissionsModel.deleteMany({ userId });
    console.log(`✅ Deleted employee permissions for user ${userId}`);

    // 2. Delete all company memberships for this user
    await CompanyMembershipModel.deleteMany({ user: userId });
    console.log(`✅ Deleted all memberships for user ${userId}`);

    // 3. Delete user's profile
    const userProfile = await ProfileModel.findOne({ userId });
    if (userProfile) {
      await ProfileModel.findByIdAndDelete(userProfile._id);
      console.log(`✅ Deleted profile for user ${userId}`);
    }

    // 4. Delete all CV analyses for this user
    await CVAnalysisModel.deleteMany({ user: userId });
    console.log(`✅ Deleted all CV analyses for user ${userId}`);

    // 5. Delete all company invitations where this user was invitedBy
    await CompanyInvitationModel.deleteMany({ invitedBy: userId });
    console.log(`✅ Deleted invitations sent by user ${userId}`);

    // 6. Finally, delete the user from the User table
    const deletedUser = await User.findByIdAndDelete(userId);
    console.log(`✅ Deleted user account ${userId}`);

    return {
      success: true,
      message: "User and all related data has been completely removed from the system",
      deletedUser: deletedUser,
    };
  } catch (error) {
    console.error("Error during user deletion cascade:", error);
    throw new Error(`Failed to delete user and related data: ${error.message}`);
  }
};

// Update the role of a membership
module.exports.updateMembershipRole = async (membershipId, newRole, updatedBy = null) => {

  const updateData = { role: newRole };
  if (updatedBy) {
    updateData.updatedBy = updatedBy;
  }

  const updated = await CompanyMembershipModel.findByIdAndUpdate(
    membershipId,
    updateData,
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
module.exports.updateMembershipDepartment = async (membershipId, departmentId, updatedBy = null) => {
  const updateData = { department: departmentId || null };
  if (updatedBy) {
    updateData.updatedBy = updatedBy;
  }

  const updated = await CompanyMembershipModel.findByIdAndUpdate(
    membershipId,
    updateData,
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

// Update both role and department of a membership
module.exports.updateMembership = async (membershipId, { role, departmentId, updatedBy }) => {
  // Build the update object
  const updateData = {};

  // Add role if provided
  if (role) {
    updateData.role = role;
  }

  // Add department if provided
  if (departmentId !== undefined) {
    updateData.department = departmentId || null;
  }

  // Add updatedBy if provided
  if (updatedBy) {
    updateData.updatedBy = updatedBy;
  }

  // If nothing to update, throw error
  if (Object.keys(updateData).length === 0) {
    throw new Error("At least one field (role or departmentId) must be provided for update");
  }

  const updated = await CompanyMembershipModel.findByIdAndUpdate(
    membershipId,
    updateData,
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
  const mongoose = require("mongoose");
  const total = await CompanyMembershipModel.countDocuments({ company: companyId });

  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const trendRaw = await CompanyMembershipModel.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
  ]);
  const trendMap = {};
  trendRaw.forEach(({ _id, count }) => { trendMap[_id] = count; });
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    trend.push({ date: d, count: trendMap[d] || 0 });
  }

  return { total, trend };
};

// Get membership by userId
module.exports.getMembershipByUserId = async (userId) => {
  const membership = await CompanyMembershipModel.findOne({ user: userId })
    .populate({
      path: "user",
      select: "username email profile",
      populate: { path: "profile", select: "firstName lastName" },
    })
    .populate("department", "name")
    .populate("company", "name")
    .populate("invitedBy", "username email");

  if (!membership) {
    throw new Error("User has no company membership");
  }

  return membership;
};

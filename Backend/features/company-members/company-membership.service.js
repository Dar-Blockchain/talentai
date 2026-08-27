const CompanyMembershipModel = require("./company-membership.model");
const User = require("../users/user.model");
const CampaignParticipant = require("../campaigns/campaign-participant.model");
const Post = require("../posts/post.model");
const ProfileSkill = require("../skills/profile-skill.model");
const SkillInterviewAssessment = require("../interviews/skill-interview/skill-interview.model");

const PASSING_RECOMMENDATIONS = ["strong_hire", "hire"];

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
    const EmployeePermissionsModel = require("./employee-permissions.model");
    const ProfileModel = require("../users/profile.model");
    const CVAnalysisModel = require("../cv-analysis/cv-analysis.model");
    const CompanyInvitationModel = require("./company-invitation.model");

    // 1. Delete all employee permissions for this user
    await EmployeePermissionsModel.deleteMany({ userId });

    // 2. Delete all company memberships for this user
    await CompanyMembershipModel.deleteMany({ user: userId });

    // 3. Delete user's profile
    const userProfile = await ProfileModel.findOne({ userId });
    if (userProfile) {
      await ProfileModel.findByIdAndDelete(userProfile._id);
    }

    // 4. Delete all CV analyses for this user
    await CVAnalysisModel.deleteMany({ user: userId });

    // 5. Delete all company invitations where this user was invitedBy
    await CompanyInvitationModel.deleteMany({ invitedBy: userId });

    // 6. Finally, delete the user from the User table
    const deletedUser = await User.findByIdAndDelete(userId);

    return {
      success: true,
      message: "User and all related data has been completely removed from the system",
      deletedUser: deletedUser,
    };
  } catch (error) {
    throw new Error(`Failed to delete user and related data: ${error.message}`);
  }
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

// Compute simple statistics for a company's memberships (counts by role/status).
// Scoped to status "active" so this reads as "confirmed members" — a revoked
// membership shouldn't count toward headcount.
module.exports.getMembershipStatsByCompany = async (companyId) => {
  const mongoose = require("mongoose");
  const total = await CompanyMembershipModel.countDocuments({ company: companyId, status: "active" });

  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const trendRaw = await CompanyMembershipModel.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId), status: "active", createdAt: { $gte: since } } },
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

// Member count grouped by role, case-insensitively deduped (role is a free-text
// field, e.g. "Manager" vs "manager"), top 7 + an "Other" bucket for the rest.
module.exports.getRoleStats = async (companyId) => {
  const mongoose = require("mongoose");
  const raw = await CompanyMembershipModel.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(companyId) } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const byKey = {};
  raw.forEach(({ _id, count }) => {
    const label = (_id || "Unknown").trim();
    const key = label.toLowerCase();
    if (!byKey[key]) byKey[key] = { role: label, count: 0 };
    byKey[key].count += count;
  });

  const sorted = Object.values(byKey).sort((a, b) => b.count - a.count);
  const TOP_N = 7;
  const top = sorted.slice(0, TOP_N);
  const restCount = sorted.slice(TOP_N).reduce((s, r) => s + r.count, 0);
  const byRole = restCount > 0 ? [...top, { role: "Other", count: restCount }] : top;

  return { byRole };
};

const _actorName = (u) => {
  const first = u?.profile?.firstName;
  const last = u?.profile?.lastName;
  return (first || last) ? `${first || ""} ${last || ""}`.trim() : (u?.username || "Unknown");
};

// Recent member activity feed for the Team dashboard: members joining, and
// permission-gated actions members take on posts/departments/campaigns
// (create, and edits where the app actually records who made them). There's
// no dedicated audit-log model in this codebase, so this is reconstructed
// from createdBy/updatedBy + timestamps on the underlying collections rather
// than a real event log — it can't cover every action (e.g. InternalCampaign
// has no updatedBy field, so campaign edits aren't attributable and are left out).
// Company-account-attributed actions (the company itself, not an employee,
// created/edited the record) are excluded — this feed is member activity only.
module.exports.getRecentActivity = async (companyId, limit = 10) => {
  const mongoose = require("mongoose");
  const InternalCampaign = require("../campaigns/campaign.model");
  const Department = require("../departments/department.model");
  const companyObjId = new mongoose.Types.ObjectId(companyId);
  const companyIdStr = String(companyId);
  const userSelect = { select: "username profile", populate: { path: "profile", select: "firstName lastName" } };
  // Skip the initial save's own updatedAt==createdAt (or near enough) so
  // creating a record isn't double-counted as "created" + "edited".
  const EDIT_GRACE_MS = 60_000;
  // Excludes the company account itself — only an actual employee counts as
  // "member activity" for this feed.
  const isEmployeeActor = (u) => !!u && String(u._id) !== companyIdStr;

  const [newMembers, posts, departments, campaigns] = await Promise.all([
    CompanyMembershipModel.find({ company: companyObjId, status: "active" })
      .sort({ createdAt: -1 }).limit(limit)
      .select("user createdAt")
      .populate({ path: "user", ...userSelect })
      .lean(),
    Post.find({ user: companyObjId })
      .sort({ updatedAt: -1 }).limit(limit)
      .select("title createdBy updatedBy createdAt updatedAt")
      .populate({ path: "createdBy", ...userSelect })
      .populate({ path: "updatedBy", ...userSelect })
      .lean(),
    Department.find({ companyId: companyObjId })
      .sort({ updatedAt: -1 }).limit(limit)
      .select("name createdBy updatedBy createdAt updatedAt")
      .populate({ path: "createdBy", ...userSelect })
      .populate({ path: "updatedBy", ...userSelect })
      .lean(),
    InternalCampaign.find({ company: companyObjId })
      .sort({ createdAt: -1 }).limit(limit)
      .select("title createdBy createdAt")
      .populate({ path: "createdBy", ...userSelect })
      .lean(),
  ]);

  const activities = [
    ...newMembers.map((m) => ({ type: "member_joined", name: _actorName(m.user), userId: String(m.user._id), label: null, entityId: null, createdAt: m.createdAt })),
    ...campaigns
      .filter((c) => isEmployeeActor(c.createdBy))
      .map((c) => ({ type: "campaign_created", name: _actorName(c.createdBy), userId: String(c.createdBy._id), label: c.title, entityId: String(c._id), createdAt: c.createdAt })),
  ];

  posts.forEach((p) => {
    if (isEmployeeActor(p.createdBy)) {
      activities.push({ type: "post_created", name: _actorName(p.createdBy), userId: String(p.createdBy._id), label: p.title, entityId: String(p._id), createdAt: p.createdAt });
    }
    const editedAfterCreation = p.updatedBy && (new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) > EDIT_GRACE_MS;
    if (editedAfterCreation && isEmployeeActor(p.updatedBy)) {
      activities.push({ type: "post_edited", name: _actorName(p.updatedBy), userId: String(p.updatedBy._id), label: p.title, entityId: String(p._id), createdAt: p.updatedAt });
    }
  });

  departments.forEach((d) => {
    if (isEmployeeActor(d.createdBy)) {
      activities.push({ type: "department_created", name: _actorName(d.createdBy), userId: String(d.createdBy._id), label: d.name, entityId: String(d._id), createdAt: d.createdAt });
    }
    const editedAfterCreation = d.updatedBy && (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) > EDIT_GRACE_MS;
    if (editedAfterCreation && isEmployeeActor(d.updatedBy)) {
      activities.push({ type: "department_edited", name: _actorName(d.updatedBy), userId: String(d.updatedBy._id), label: d.name, entityId: String(d._id), createdAt: d.updatedAt });
    }
  });

  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { activities: activities.slice(0, limit) };
};

// The 27 EmployeePermissions flags, grouped the same way the permissions
// model itself is commented/organized — used to collapse them into an
// 8-category coverage summary ("full"/"partial"/"none") instead of showing
// all 27 raw booleans, which doesn't scale to a table once there are more
// than a handful of employees.
const PERMISSION_CATEGORIES = {
  jobPosts:    ["canViewJobPosts", "canCreateJobPosts"],
  candidates:  ["canViewCandidates", "canViewInterviewResults", "canContactCandidates"],
  matching:    ["canAccessMatching"],
  hrAgents:    ["canUseHRAgents"],
  team:        ["canManageTeam", "canInviteMembers", "canAssignRoles", "canRemoveEmployee", "canUpdateEmployeeDepartment", "canManagePermissions"],
  campaigns:   ["canViewCampaigns", "canCreateCampaign", "canEditCampaign", "canDeleteCampaign", "canPublishCampaign"],
  departments: ["canViewDepartments", "canCreateDepartment", "canEditDepartment", "canDeleteDepartment"],
  settings:    ["canViewCompanyProfile", "canEditCompanyProfile", "canManageSettings", "canManageBilling", "canManageIntegrations"],
};

// Permissions matrix: active employees × permission-category coverage, paged
// and (username/email) searchable so this stays usable for companies with a
// lot of employees — never loads the whole roster at once.
module.exports.getPermissionsMatrix = async (companyId, page = 1, limit = 20, search = "") => {
  const EmployeePermissionsModel = require("./employee-permissions.model");
  const query = { company: companyId, status: "active" };

  if (search) {
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    query.user = { $in: users.map((u) => u._id) };
  }

  const skip = (page - 1) * limit;
  const total = await CompanyMembershipModel.countDocuments(query);
  const memberships = await CompanyMembershipModel.find(query)
    .sort({ createdAt: -1 }).skip(skip).limit(limit)
    .populate({ path: "user", select: "username profile", populate: { path: "profile", select: "firstName lastName" } })
    .lean();

  const membershipIds = memberships.map((m) => m._id);
  const permsByMembership = await EmployeePermissionsModel.find({ membershipId: { $in: membershipIds } }).lean();
  const permsMap = Object.fromEntries(permsByMembership.map((p) => [p.membershipId.toString(), p]));

  const employees = memberships.map((m) => {
    const perms = permsMap[m._id.toString()] || {};
    const categories = {};
    const flags = {};
    Object.entries(PERMISSION_CATEGORIES).forEach(([cat, flagNames]) => {
      const values = flagNames.map((f) => !!perms[f]);
      categories[cat] = values.every(Boolean) ? "full" : values.some(Boolean) ? "partial" : "none";
      flagNames.forEach((f, i) => { flags[f] = values[i]; });
    });
    return { userId: m.user?._id ? String(m.user._id) : null, name: _actorName(m.user), role: m.role, categories, flags };
  });

  return { employees, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
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

  const profileId = membership.user?.profile?._id;

  const [campaignsCount, jobPostsCount, skillDocs, interviewsPassed] = await Promise.all([
    CampaignParticipant.countDocuments({ employee: userId }),
    Post.countDocuments({ createdBy: userId }),
    profileId ? ProfileSkill.find({ profile: profileId }).select("name").lean() : [],
    profileId
      ? SkillInterviewAssessment.countDocuments({
          candidateId: profileId,
          "interviewData.finalReport.recommendation": { $in: PASSING_RECOMMENDATIONS },
        })
      : 0,
  ]);

  return {
    ...membership.toObject(),
    campaignsCount,
    jobPostsCount,
    skills: skillDocs.map((s) => s.name),
    interviewsPassed,
  };
};

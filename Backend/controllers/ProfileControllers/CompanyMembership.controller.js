const CompanyMembershipService = require("../../services/ProfileService/CompanyMembership.service");
const CompanyInvitationService = require("../../services/ProfileService/CompanyInvitation.service");

const flattenMembership = (membership) => {
  const m = membership?.toObject ? membership.toObject() : membership;
  const user = m?.user || {};
  const profile = user?.profile || {};

  const { user: _user, department: _department, company: _company, ...rest } = m;

  const result = {
    ...rest,
    userId: user._id || null,
    username: user.username || null,
    email: user.email || null,
    firstName: profile.firstName || null,
    lastName: profile.lastName || null,
  };

  // Inclure le département seulement s'il existe
  if (m?.department) {
    result.department = m.department;
  }

  return result;
};

// Get all memberships for a company
module.exports.getMembershipsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { search, status, department, page = 1, limit = 10, sortBy, order, role, departmentId } = req.query;

    // Build filters object
    const filters = {};
    if (role) filters.role = role;
    if (sortBy) filters.sortBy = sortBy;
    if (order) filters.order = order;
    if (departmentId) filters.departmentId = departmentId;
    if (search) filters.search = search;

    const result = await CompanyMembershipService.getMembershipsByCompany(
      companyId,
      search,
      status,
      department,
      parseInt(page),
      parseInt(limit),
      filters,
    );

    const memberships = (result.memberships || []).map(flattenMembership);

    res.json({ success: true, ...result, memberships });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a membership and completely remove the user from the system
module.exports.deleteMembership = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const companyOwnerId = req.user._id;
    
    const result = await CompanyMembershipService.deleteMembership(
      membershipId,
      companyOwnerId,
    );
    
    res.json({ 
      success: true, 
      message: result.message,
      deleted: result 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update membership role
module.exports.updateMembershipRole = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { role } = req.body;

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "Role is required and must be a string",
      });
    }

    const updated = await CompanyMembershipService.updateMembershipRole(
      membershipId,
      role,
    );
    res.json({ success: true, updated: flattenMembership(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update membership department (assign or unassign from department)
module.exports.updateMembershipDepartment = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { departmentId } = req.body;

    const updated = await CompanyMembershipService.updateMembershipDepartment(
      membershipId,
      departmentId,
    );
    res.json({ success: true, updated: flattenMembership(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update membership (role and/or department)
module.exports.updateMembership = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { role, departmentId } = req.body;

    // Validate that at least one field is provided
    if (!role && departmentId === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (role or departmentId) must be provided",
      });
    }

    const updated = await CompanyMembershipService.updateMembership(
      membershipId,
      { role, departmentId },
    );
    res.json({ success: true, updated: flattenMembership(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get simple statistics for memberships and invitations belonging to a company
module.exports.getMembershipStats = async (req, res) => {
  try {
    const companyId = req.user._id;
    const membershipStats = await CompanyMembershipService.getMembershipStatsByCompany(
      companyId,
    );
    const invitationStats = await CompanyInvitationService.getInvitationStatsByCompany(
      companyId,
    );

    // combine totals for overall count
    const combinedTotal =
      (membershipStats?.total || 0) + (invitationStats?.total || 0);

    res.json({
      success: true,
      stats: {
        total: combinedTotal,
        memberships: membershipStats,
        invitations: invitationStats,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

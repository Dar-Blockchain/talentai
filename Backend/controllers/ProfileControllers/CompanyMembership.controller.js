const CompanyMembershipService = require("../../services/ProfileService/CompanyMembership.service");
const CompanyInvitationService = require("../../services/ProfileService/CompanyInvitation.service");

const flattenMembership = (membership) => {
  const m = membership?.toObject ? membership.toObject() : membership;
  const user = m?.user || {};
  const profile = user?.profile || {};

  return {
    ...m,
    username: user.username || null,
    email: user.email || null,
    firstName: profile.firstName || null,
    lastName: profile.lastName || null,
  };
};

// Get all memberships for a company
module.exports.getMembershipsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { search, status, department, page = 1, limit = 10 } = req.query;

    const result = await CompanyMembershipService.getMembershipsByCompany(
      companyId,
      search,
      status,
      department,
      parseInt(page),
      parseInt(limit),
    );

    const memberships = (result.memberships || []).map(flattenMembership);

    res.json({ success: true, ...result, memberships });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all memberships for a specific department in the current company
module.exports.getMembershipsByDepartment = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { departmentId } = req.params;
    const { search, status, page = 1, limit = 10 } = req.query;

    const result = await CompanyMembershipService.getMembershipsByCompany(
      companyId,
      search,
      status,
      departmentId,
      parseInt(page),
      parseInt(limit),
    );

    const memberships = (result.memberships || []).map(flattenMembership);

    res.json({ success: true, ...result, memberships });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a membership
module.exports.deleteMembership = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const companyOwnerId = req.user._id;
    const deleted = await CompanyMembershipService.deleteMembership(
      membershipId,
      companyOwnerId,
    );
    res.json({ success: true, deleted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

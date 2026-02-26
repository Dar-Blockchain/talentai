const CompanyMembershipService = require("../../services/ProfileService/CompanyMembership.service");
const CompanyInvitationService = require("../../services/ProfileService/CompanyInvitation.service");

// Get all memberships for a company
module.exports.getMembershipsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { username, role } = req.query;

    // Build filters object
    const filters = {};
    if (username) filters.username = username;
    if (role) filters.role = role;

    const memberships = await CompanyMembershipService.getMembershipsByCompany(
      companyId,
      filters,
    );
    res.json({ success: true, memberships });
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
    res.json({ success: true, updated });
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

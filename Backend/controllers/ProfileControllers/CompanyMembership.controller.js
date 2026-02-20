const CompanyMembershipService = require("../../services/ProfileService/CompanyMembership.service");

// Get all memberships for a company
module.exports.getMembershipsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const memberships = await CompanyMembershipService.getMembershipsByCompany(companyId);
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

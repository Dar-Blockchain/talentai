const CompanyInvitationService = require("../../services/ProfileService/CompanyInvitationService");

module.exports. sentInvitation = async (req, res) => {
    try {
      const { email, role } = req.body;
      const invitedBy = req.user._id;
      const username = req.user.username;
      const member = await CompanyInvitationService.sentInvitation(invitedBy, email, role, invitedBy, username);
      res.json({ success: true, member });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.listEmployees = async (req, res) => {
    try {
      const { accountId } = req.params;
      const members = await CompanyInvitationService.listEmployees(accountId);
      res.json({ success: true, members });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.listMyEmployees = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const members = await CompanyInvitationService.listMyEmployees(ownerId);
    res.json({ success: true, members });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.updateRole = async (req, res) => {
    try {
      const { role } = req.body;
      const { OrganizationId, userId } = req.params;
      const member = await CompanyInvitationService.updateRole(OrganizationId, userId, role);
      res.json({ success: true, member });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.removeEmployee = async (req, res) => {
  try {
    const { OrganizationId, userId } = req.params;
    const removed = await CompanyInvitationService.removeEmployee(OrganizationId, userId);
    res.json({ success: true, removed });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.resendInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const updated = await CompanyInvitationService.resendInvitation(invitationId);
    res.json({ success: true, updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.deleteInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const deleted = await CompanyInvitationService.deleteInvitation(invitationId);
    res.json({ success: true, deleted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


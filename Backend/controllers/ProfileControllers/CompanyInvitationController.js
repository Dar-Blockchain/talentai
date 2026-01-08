const CompanyInvitationService = require("../../services/ProfileService/CompanyInvitationService");

module.exports.sentInvitation = async (req, res) => {
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

module.exports.respondInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    if (!action || !["accept","reject"].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    if (action === "accept") {
      const userId = req.user._id;
      const userEmail = req.user.email;
      const accepted = await CompanyInvitationService.acceptInvitation(invitationId, userId, userEmail);
      return res.json({ success: true, accepted });
    }

    const rejected = await CompanyInvitationService.rejectInvitation(invitationId);
    return res.json({ success: true, rejected });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.getCompanyInvitations = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const invitations = await CompanyInvitationService.getCompanyInvitations(ownerId);
    res.json({ success: true, invitations });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.getInvitationDetails = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const invitation = await CompanyInvitationService.getInvitationDetails(invitationId);
    res.json({ success: true, invitation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
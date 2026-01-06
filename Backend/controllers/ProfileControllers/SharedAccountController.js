const AccountService = require("../../services/ProfileService/SharedAccountService");

module.exports.createCompany = async (req, res) => {
    try {
      const ownerId = req.user._id;
      const account = await AccountService.createCompany(ownerId, req.user.username);
      res.json({ success: true, account });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

module.exports.addEmployee = async (req, res) => {
    try {
      const { OrganizationId, email, role } = req.body;
      const invitedBy = req.user._id;
      const username = req.user.username;
      const member = await AccountService.addEmployee(OrganizationId, email, role, invitedBy, username);
      res.json({ success: true, member });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

module.exports.listEmployees = async (req, res) => {
    try {
      const { accountId } = req.params;
      const members = await AccountService.listEmployees(accountId);
      res.json({ success: true, members });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

module.exports.listMyEmployees = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const members = await AccountService.listMyEmployees(ownerId);
    res.json({ success: true, members });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports.updateRole = async (req, res) => {
    try {
      const { role } = req.body;
      const { OrganizationId, userId } = req.params;
      const member = await AccountService.updateRole(OrganizationId, userId, role);
      res.json({ success: true, member });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
};

module.exports.removeEmployee = async (req, res) => {
  try {
    const { OrganizationId, userId } = req.params;
    const removed = await AccountService.removeEmployee(OrganizationId, userId);
    res.json({ success: true, removed });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

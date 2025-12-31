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
      const { accountId, email, role } = req.body;
      const invitedBy = req.user._id;
      const member = await AccountService.addEmployee(accountId, email, role, invitedBy);
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

  
module.exports.updateRole = async (req, res) => {
    try {
      const { accountId, userId, newRole } = req.body;
      const member = await AccountService.updateRole(accountId, userId, newRole);
      res.json({ success: true, member });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

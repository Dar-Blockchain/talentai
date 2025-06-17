const usersService = require("../services/usersService");

module.exports.getAllUsers = async (req, res) => {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  };
  
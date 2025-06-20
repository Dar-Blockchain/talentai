// usersController.js
const usersService = require("../services/usersService");

module.exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Appeler le service pour récupérer les utilisateurs avec pagination
    const result = await usersService.getAllUsers(page, limit);

    // Retourner la réponse avec les utilisateurs et la pagination
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des utilisateurs" });
  }
};

// usersController.js
const usersService = require("../services/usersService");

module.exports.getAllUsers = async (req, res) => {
  try {
    const { username = '', email = '', role = '', page = 1, limit = 10 } = req.query;

    // Créer l'objet searchQuery pour passer au service
    const searchQuery = { username, email, role };

    // Appeler le service pour récupérer les utilisateurs avec pagination et recherche
    const result = await usersService.getAllUsers(searchQuery, page, limit);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des utilisateurs" });
  }
};

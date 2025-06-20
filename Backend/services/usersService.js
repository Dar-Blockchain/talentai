// usersService.js
const User = require("../models/UserModel");

module.exports.getAllUsers = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Récupérer les utilisateurs avec pagination et peupler les champs 'profile' et 'post'
    const users = await User.find()
      .skip(skip)
      .limit(parseInt(limit)) // Limiter les résultats
      .populate('profile')    // Peupler le champ 'profile'
      .populate('post')       // Peupler le champ 'post'
      .exec();

    // Récupérer le nombre total d'utilisateurs pour calculer le nombre total de pages
    const totalUsers = await User.countDocuments();

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
      },
    };
  } catch (error) {
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
};

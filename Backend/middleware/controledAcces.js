module.exports.controledAcces = (role) => {
  return async (req, res, next) => {
    if (req.user.role === role) {
      next(); // Si le rôle de l'utilisateur correspond, continue l'exécution
    } else {
      res.status(401).json("Unauthorized"); // Si non, renvoie une erreur 401
    }
  };
};

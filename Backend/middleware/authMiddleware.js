const jwt = require("jsonwebtoken");
const userModel = require("../models/UserModel");

const requireAuthUser = async (req, res, next) => {
     // const token = req.cookies.jwt_token;

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

    if (token) {
        jwt.verify(token, process.env.Net_Secret, async (err, decodedToken) => {
            if (err) {
                res.status(401).json({ message: "Token invalide ou expiré" });
            } else {
                try {
                    const user = await userModel.findById(decodedToken.id).populate("profile");
                    if (!user) {
                        return res.status(401).json({ message: "Utilisateur non trouvé" });
                    }
                    req.user = user;
                    next();
                } catch (error) {
                    res.status(500).json({ message: "Erreur lors de la vérification de l'utilisateur" });
                }
            }
        });
    } else {
        res.status(401).json({ message: "Accès non autorisé - Token manquant" });
    }
};

module.exports = { requireAuthUser }; 
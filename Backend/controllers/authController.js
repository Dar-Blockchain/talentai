const authService = require("../services/authService");
const User = require("../models/UserModel");

// Route d'inscription
module.exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.registerUser(email);

    res.status(201).json({
      message: result.message,
      email: result.email,
      username: result.username,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Vérification OTP
module.exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
        
    const result = await authService.verifyUserOTP(email, otp);

    res.cookie("jwt_token", result.token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Créer la session avec le token
    res.status(200).json({
      message: "Email vérifié avec succès",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const { OAuth2Client } = require("google-auth-library"); // Importer la bibliothèque

// Initialisation du client OAuth2 avec ton Client ID Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Connexion avec Gmail
module.exports.connectWithGmail = async (req, res) => {
  try {
    const { id_token } = req.body; // Récupère le `id_token` envoyé par le frontend
    //console.log("id_token", id_token);

    // Vérifier le token avec l'API Google
    const ticket = await client.verifyIdToken({
      idToken: id_token, // Vérifier le token reçu
      audience: process.env.GOOGLE_CLIENT_ID, // Ton Client ID Google
    });
    //console.log("ticket", ticket);

    // Extraire les informations de l'utilisateur depuis le token validé
    const payload = ticket.getPayload();
    const email = payload.email;
    //console.log("payload", payload);
    //console.log("email", email);

    const result = await authService.connectWithGmail(email);

    // Créer un cookie avec le token JWT
    res.cookie("jwt_token", result.token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: result.message,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Route de déconnexion
module.exports.logout = (req, res) => {
  // Supprimer le cookie JWT
  res.clearCookie("jwt_token");

  // Détruire la session si elle existe
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erreur lors de la destruction de la session:", err);
        return res
          .status(500)
          .json({ message: "Erreur lors de la déconnexion" });
      }
      res.status(200).json({ message: "Déconnexion réussie" });
    });
  } else {
    res.status(200).json({ message: "Déconnexion réussie" });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};


module.exports.GetEmailGmailByToken = async (req, res) => {
  try {
    const { id_token } = req.body; // Récupère le `id_token` envoyé par le frontend

    // Vérifier le token avec l'API Google
    const ticket = await client.verifyIdToken({
      idToken: id_token, // Vérifier le token reçu
      audience: process.env.GOOGLE_CLIENT_ID, // Ton Client ID Google
    });

    // Extraire les informations de l'utilisateur depuis le token validé
    const payload = ticket.getPayload();
    const email = payload.email;

    // Retourner uniquement l'email sans cookie et sans sauvegarde
    res.status(200).json({
      email,
      message: "Email récupéré avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erreur lors de la récupération de l'email." });
  }
};

module.exports.warnUser = async (req, res) => {
  try {
    const user = req.user;
        
    const result = await authService.warnUser(user.email);

    // Créer la session avec le token
    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
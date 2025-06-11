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

// Connexion avec Gmail
module.exports.connectWithGmail = async (req, res) => {
  try {
    const { email , idToken } = req.body;
    console.log("idToken", idToken);

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

// Connexion avec Gmail
module.exports.Gmail = async (req, res) => {
  try {
    // Récupère le `id_token` envoyé par le frontend
    const { idToken } = req.body;

    // Vérifier le token avec l'API Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Ton Client ID Google
    });

    // Extraire les informations de l'utilisateur depuis le token validé
    const payload = ticket.getPayload();
    const email = payload.email;
    const emailVerified = payload.email_verified;

    // Vérifier si l'email est vérifié par Google
    if (!emailVerified) {
      return res.status(401).json({ message: "Email non vérifié par Google." });
    }

    // Vérifier si l'utilisateur existe déjà dans la base de données
    let user = await User.findOne({ email });

    if (!user) {
      // Si l'utilisateur n'existe pas, créer un nouvel utilisateur
      const username = email.split("@")[0]; // Créer un nom d'utilisateur basé sur l'email
      user = new User({
        username,
        email,
        isVerified: true, // L'utilisateur est vérifié via Google
        trafficCounter: 1,
        lastLogin: new Date(),
      });
      await user.save(); // Sauvegarder l'utilisateur dans la base de données
    } else {
      // Si l'utilisateur existe déjà, mettre à jour la date de connexion et le compteur de trafic
      user.lastLogin = new Date();
      user.trafficCounter += 1;
      await user.save(); // Sauvegarder les changements dans la base de données
    }

    // Générer un token JWT pour l'utilisateur
    const token = generateToken(user._id);

    // Ajouter un cookie avec le JWT (ce cookie sera utilisé pour maintenir la session)
    res.cookie("jwt_token", token, {
      httpOnly: true, // Empêche l'accès au cookie via JavaScript
      maxAge: 7 * 24 * 60 * 60 * 1000, // Le cookie expire après 7 jours
    });

    // Réponse avec le message de succès, l'utilisateur et le token
    res.status(200).json({
      message: user.isVerified
        ? "Connexion réussie"
        : "Compte créé avec succès",
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const User = require("../models/UserModel");
const { sendOTP } = require("./emailService");
const { generateOTP } = require("../utils/Onetimepassword");
const { generateToken } = require("../utils/generateToken");
const { getGmailByToken } = require("../utils/getGmailByToken");

// Extraire le nom d'utilisateur de l'email
const extractUsernameFromEmail = (email) => {
  return email.split("@")[0];
};

// Service d'inscription
module.exports.registerUser = async (email) => {
  // Extraire le nom d'utilisateur de l'email
  const username = extractUsernameFromEmail(email);

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    // Si l'utilisateur existe, générer un nouveau code OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

    existingUser.otp = {
      code: otp,
      expiresAt: otpExpiry,
    };
    await existingUser.save();

    // Envoyer le nouveau OTP par email
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      throw new Error("Erreur lors de l'envoi de l'OTP");
    }

    return {
      email,
      username: existingUser.username,
      message: "Nouveau code OTP envoyé à votre email",
    };
  }

  // Générer OTP pour un nouvel utilisateur
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

  // Créer un portefeuille Hedera pour le nouvel utilisateur
  //const { pubkey, privkey, accountId } = await hederaService.createHederaWallet();

  // Créer l'utilisateur avec le portefeuille Hedera
  const user = new User({
    username,
    email,
    otp: {
      code: otp,
      expiresAt: otpExpiry,
    },
    //pubkey,
    //privkey,
    //accountId,
  });

  await user.save();

  // Envoyer l'OTP par email
  const emailSent = await sendOTP(email, otp);
  if (!emailSent) {
    throw new Error("Erreur lors de l'envoi de l'OTP");
  }

  return {
    email,
    username,
    message:
      "Inscription réussie. Veuillez vérifier votre email pour le code OTP.",
  };
};

// Service de vérification OTP
module.exports.verifyUserOTP = async (email, otp) => {
  const user = await User.findOne({ email });  
  
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  if (user && user.isBanned) {
    return res.status(403).json({
      message: "You are banned. Please check and contact support.",
    });
  }

  if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
    throw new Error("Aucun OTP trouvé");
  }

  if (user.otp.code !== otp) {
    throw new Error("Code OTP incorrect");
  }

  if (new Date() > user.otp.expiresAt) {
    throw new Error("Code OTP expiré");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.lastLogin = new Date();
  user.trafficCounter = user.trafficCounter + 1;
  await user.save();

  // Générer le token JWT
  const token = generateToken(user._id);
  console.log(token);
  return {
    user,
    token,
  };
};

// Service de connexion avec Gmail
module.exports.connectWithGmail = async (id_token) => {

  const email = await authService.GetGmailByToken(id_token);

  // Vérifier si l'utilisateur existe déjà
  let user = await User.findOne({ email });

  if (user && user.isBanned) {
    return res.status(403).json({
      message: "You are banned. Please check and contact support.",
    });
  }

  if (!user) {
    // Si l'utilisateur n'existe pas, créer un nouveau compte avec un portefeuille Hedera
    const username = extractUsernameFromEmail(email);
    /*const { pubkey, privkey, accountId } =
      await hederaService.createHederaWallet();
*/
    user = new User({
      username,
      email,
      isVerified: true, // L'utilisateur est déjà vérifié via Gmail
      trafficCounter: 1,
      lastLogin: new Date(),
    });

    await user.save();
  } else {
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    user.trafficCounter = user.trafficCounter + 1;
    await user.save();
  }

  // Générer le token JWT
  const token = generateToken(user._id);

  return {
    user,
    token,
    message: user.isVerified ? "Connexion réussie" : "Compte créé avec succès",
  };
};

module.exports.warnUser = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (user.isBanned) {
    return {
      message: "User is already banned",
      user,
    };
  }

  user.warnings = (user.warnings || 0) + 1;

  if (user.warnings >= 3) {
    user.isBanned = true;
    await user.save();
    return {
      message: "User has been banned after receiving 3 warnings",
      user,
    };
  }

  await user.save();

  return {
    message: `User has received warning ${user.warnings}/3`,
    user,
  };
};

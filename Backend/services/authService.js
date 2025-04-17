const User = require('../models/UserModel');
const { sendOTP } = require('./emailService');
const jwt = require('jsonwebtoken');

// Générer un code OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Extraire le nom d'utilisateur de l'email
const extractUsernameFromEmail = (email) => {
  return email.split('@')[0];
};

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.Net_Secret, {
    expiresIn: '24h'
  });
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
      expiresAt: otpExpiry
    };
    await existingUser.save();

    // Envoyer le nouveau OTP par email
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      throw new Error('Erreur lors de l\'envoi de l\'OTP');
    }

    return { 
      email, 
      username: existingUser.username,
      message: 'Nouveau code OTP envoyé à votre email'
    };
  }

  // Générer OTP pour un nouvel utilisateur
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes

  // Créer l'utilisateur
  const user = new User({
    username,
    email,
    otp: {
      code: otp,
      expiresAt: otpExpiry
    }
  });

  await user.save();

  // Envoyer l'OTP par email
  const emailSent = await sendOTP(email, otp);
  if (!emailSent) {
    throw new Error('Erreur lors de l\'envoi de l\'OTP');
  }

  return { 
    email, 
    username,
    message: 'Inscription réussie. Veuillez vérifier votre email pour le code OTP.'
  };
};

// Service de vérification OTP
module.exports.verifyUserOTP = async (email, otp) => {
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
    throw new Error('Aucun OTP trouvé');
  }

  if (user.otp.code !== otp) {
    throw new Error('Code OTP incorrect');
  }

  if (new Date() > user.otp.expiresAt) {
    throw new Error('Code OTP expiré');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.lastLogin = new Date();
  await user.save();

  // Générer le token JWT
  const token = generateToken(user._id);
  console.log(token);
  return {
    user,
    token
  };
};

// Service de connexion avec Gmail
module.exports.connectWithGmail = async (email) => {
  // Vérifier si l'utilisateur existe déjà
  let user = await User.findOne({ email });
  
  if (!user) {
    // Si l'utilisateur n'existe pas, créer un nouveau compte
    const username = extractUsernameFromEmail(email);
    
    user = new User({
      username,
      email,
      isVerified: true, // L'utilisateur est déjà vérifié via Gmail
      lastLogin: new Date()
    });
    
    await user.save();
  } else {
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();
  }
  
  // Générer le token JWT
  const token = generateToken(user._id);
  
  return {
    user,
    token,
    message: user.isVerified ? 'Connexion réussie' : 'Compte créé avec succès'
  };
};

module.exports.getAllUsers = async () => {
  const users = await User.find();
  return users;
};
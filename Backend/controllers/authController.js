const authService= require('../services/authService');

// Route d'inscription
module.exports.register = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.registerUser(email);
    
    res.status(201).json({
      message: result.message,
      email: result.email,
      username: result.username
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

    res.cookie('jwt_token', result.token, { httpOnly: false, maxAge: 2 * 60 * 60 * 1000 });
    // Créer la session avec le token
    res.status(200).json({ 
      message: 'Email vérifié avec succès',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Connexion avec Gmail
module.exports.connectWithGmail = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.connectWithGmail(email);
    
    // Créer un cookie avec le token JWT
    res.cookie('jwt_token', result.token, { httpOnly: false, maxAge: 2 * 60 * 60 * 1000 });
    
    res.status(200).json({
      message: result.message,
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Route de déconnexion
module.exports.logout = (req, res) => {
  // Supprimer le cookie JWT
  res.clearCookie('jwt_token');
  
  // Détruire la session si elle existe
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur lors de la destruction de la session:', err);
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      res.status(200).json({ message: 'Déconnexion réussie' });
    });
  } else {
    res.status(200).json({ message: 'Déconnexion réussie' });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};
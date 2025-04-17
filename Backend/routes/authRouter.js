const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {requireAuthUser} = require('../middleware/authMiddleware');

// Route d'inscription
router.post('/register', authController.register);

// Route de vérification OTP
router.post('/verify-otp', authController.verifyOTP);

// Route de connexion avec Gmail
router.post('/connect-gmail', authController.connectWithGmail);

router.get('/getAllUsers', requireAuthUser, authController.getAllUsers);

// Route de déconnexion
router.post('/logout', authController.logout);

module.exports = router; 
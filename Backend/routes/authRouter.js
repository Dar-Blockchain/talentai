const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/authLogMiddleware")
// Route d'inscription
router.post("/register", authLogMiddleware,authController.register);

// Route de vérification OTP
router.post("/verify-otp", authController.verifyOTP);

// Route de connexion avec Gmail
router.post("/connect-gmail", authController.connectWithGmail);

router.get("/GetGmailByToken", authController.GetGmailByToken);

router.get("/warnUser", requireAuthUser,authController.warnUser);

// Route de déconnexion
router.post("/logout", authController.logout);

module.exports = router;

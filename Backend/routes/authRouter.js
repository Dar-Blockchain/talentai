const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
// Route d'inscription
router.post("/register", authLogMiddleware("Auth"),authController.register);

// Route de vérification OTP
router.post("/verify-otp", authLogMiddleware("Auth"),authController.verifyOTP);

// Route de connexion avec Gmail
router.post("/connect-gmail", authLogMiddleware("Auth"),authController.connectWithGmail);

router.get("/GetGmailByToken", authController.GetGmailByToken);

router.get("/warnUser", requireAuthUser,authLogMiddleware("Auth"),authController.warnUser);

// Route de déconnexion
router.post("/logout", requireAuthUser,authLogMiddleware("Auth"),authController.logout);

module.exports = router;

/**
 * Routes d'authentification utilisateur
 *
 * Middlewares globaux appliqués:
 * - LogMiddleware("Auth"): journalise chaque requête liée à l'auth
 *
 * Remarque: certaines routes sont publiques (inscription, OTP, connexions),
 * d'autres nécessitent une authentification via `requireAuthUser`.
 */
const express = require("express");
const router = express.Router();
const authController = require("../controllers/Authentication/authenticationController");

const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Journalisation de toutes les requêtes de ce routeur
router.use(authLogMiddleware("Auth"));

// POST /auth/register
// Accès: Public
// Corps attendu: { email, password, ... }
// Description: Crée un nouvel utilisateur et envoie un OTP si nécessaire
router.post("/register", authController.register);

// POST /auth/verify-otp
// Accès: Public
// Corps attendu: { email, otp }
// Description: Vérifie le code OTP pour activer/valider le compte
router.post("/verify-otp", authController.verifyOTP);

// POST /auth/connect-gmail
// Accès: Public
// Corps attendu: { tokenGoogle | codeOAuth }
// Description: Connecte l'utilisateur via Google et retourne un jeton applicatif
router.post("/connect-gmail", authController.connectWithGmail);

// GET /auth/GetGmailByToken
// Accès: Public
// Query/Headers: jeton Google
// Description: Récupère les informations Gmail à partir d'un token
router.get("/GetGmailByToken", authController.GetGmailByToken);

// GET /auth/warnUser
// Accès: Protégé (Utilisateur authentifié)
// Description: Notifie/avertit l'utilisateur connecté (usage interne)
router.get("/warnUser", requireAuthUser, authController.warnUser);

// POST /auth/logout
// Accès: Protégé (Utilisateur authentifié)
// Description: Invalide la session/jeton côté serveur si applicable
router.post("/logout", requireAuthUser, authController.logout);

module.exports = router;

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
const authController = require("../controllers/authentication.controller");

const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const uploadfile = require("../middleware/fileResume-upload.middleware");


// Journalisation de toutes les requêtes de ce routeur
router.use(authLogMiddleware("Auth"));

// POST /auth/register
// Accès: Public
// Corps attendu pour Candidate: { email, roleType: "Candidate", firstName (REQUIRED), lastName (REQUIRED), phone (optional), resume (optional file) }
// Corps attendu pour Company: { email, roleType: "Company", name (optional), companyDetails (optional) }
// Description: Crée un nouvel utilisateur et son profil selon roleType, puis envoie un OTP. Pour les Candidates, le CV est automatiquement analysé et enregistré dans le model CVAnalysis. FirstName et lastName sont obligatoires pour Candidate. Resume peut être téléchargé pour les Candidates.
router.post("/register", uploadfile.single('resume'), authController.register);

// POST /auth/login
// Accès: Public
// Corps attendu: { email }
// Description: Envoie un OTP à un utilisateur existant pour se connecter
router.post("/", authController.login);

// POST /auth/analyze
// Accès: Public
// Corps attendu: { filePath: "public/images/Users/resume.pdf", saveToDatabase?: true }
// Description: Analyse un CV stocké, extrait les informations via Bedrock et les enregistre dans CVAnalysis model
router.post("/analyze", authController.parseCV);

// POST /auth/verify-otp
// Accès: Public
// Corps attendu: { email, otp }
// Description: Vérifie le code OTP pour activer/valider le compte
router.post("/verify-otp", authController.verifyOTP);

// POST /auth/resend-otp
// Accès: Public
// Corps attendu: { email }
// Description: Renvoie un nouveau code OTP à l'utilisateur par email (valide 5 minutes)
router.post("/resend-otp", authController.resendOTP);

// POST /auth/connect-gmail
// Accès: Public
// Corps attendu: { tokenGoogle | codeOAuth }
// Description: Connecte l'utilisateur via Google et retourne un jeton applicatif
router.post("/connect-gmail", authController.connectWithGmail);

// GET /auth/warnUser
// Accès: Protégé (Utilisateur authentifié)
// Description: Notifie/avertit l'utilisateur connecté (usage interne)
router.get("/warnUser", requireAuthUser, authController.warnUser);

// POST /auth/logout
// Accès: Protégé (Utilisateur authentifié)
// Description: Invalide la session/jeton côté serveur si applicable
router.post("/logout", requireAuthUser, authController.logout);

module.exports = router;

const express = require("express");
const router  = express.Router();

const authController    = require("../controllers/authentication.controller");
const { requireAuth }   = require("../middleware/security/auth.middleware");
const authLog           = require("../middleware/security/request-log.middleware");
const uploadfile        = require("../middleware/fileResume-upload.middleware");

router.use(authLog("Auth"));

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/register",    uploadfile.single("resume"), authController.register);
router.post("/",            authController.login);
router.post("/verify-otp",  authController.verifyOTP);
router.post("/resend-otp",  authController.resendOTP);
router.get( "/check-role",  authController.checkRole);

// ── Protected ─────────────────────────────────────────────────────────────────
router.post("/analyze",  requireAuth, authController.parseCV);
router.post("/logout",   requireAuth, authController.logout);
router.get( "/warnUser", requireAuth, authController.warnUser);

module.exports = router;

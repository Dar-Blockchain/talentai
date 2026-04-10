/**
 * User authentication routes
 *
 * Global middlewares applied:
 * - LogMiddleware("Auth"): logs each auth-related request
 *
 * Note: some routes are public (registration, OTP, logins),
 * others require authentication via `requireAuthUser`.
 */
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authentication.controller");

const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const uploadfile = require("../middleware/fileResume-upload.middleware");


// Logging all requests from this router
router.use(authLogMiddleware("Auth"));

// POST /auth/register
// Access: Public
// Expected body for Candidate: { email, roleType: "Candidate", firstName (REQUIRED), lastName (REQUIRED), phone (optional), resume (optional file) }
// Expected body for Company: { email, roleType: "Company", name (optional), companyDetails (optional) }
// Description: Creates a new user and profile according to roleType, then sends an OTP. For Candidates, the resume is automatically analyzed and stored in CVAnalysis model. FirstName and lastName are required for Candidate. Resume can be uploaded for Candidates.
router.post("/register", uploadfile.single('resume'), authController.register);

// POST /auth/login
// Access: Public
// Expected body: { email }
// Description: Sends an OTP to an existing user to log in
router.post("/", authController.login);

// POST /auth/analyze
// Access: Public
// Expected body: { filePath: "public/images/Users/resume.pdf", saveToDatabase?: true }
// Description: Analyzes a stored resume, extracts information via Bedrock and stores it in CVAnalysis model
router.post("/analyze", authController.parseCV);

// POST /auth/verify-otp
// Access: Public
// Expected body: { email, otp }
// Description: Verifies OTP code to activate/validate account
router.post("/verify-otp", authController.verifyOTP);

// POST /auth/resend-otp
// Access: Public
// Expected body: { email }
// Description: Sends a new OTP code to user via email (valid for 5 minutes)
router.post("/resend-otp", authController.resendOTP);

// POST /auth/connect-gmail
// Access: Public
// Expected body: { tokenGoogle | codeOAuth }
// Description: Connects user via Google and returns an application token
router.post("/connect-gmail", authController.connectWithGmail);

// GET /auth/warnUser
// Access: Protected (Authenticated user)
// Description: Notifies/warns the logged-in user (internal use)
router.get("/warnUser", requireAuthUser, authController.warnUser);

// POST /auth/logout
// Access: Protected (Authenticated user)
// Description: Invalidates session/token on server side if applicable
router.post("/logout", requireAuthUser, authController.logout);

module.exports = router;

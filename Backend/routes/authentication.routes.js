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

const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const uploadfile = require("../middleware/fileResume-upload.middleware");


// Logging all requests from this router
router.use(authLogMiddleware("Auth"));

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a Candidate or Company account, then sends an OTP. Candidates may attach a resume which is auto-analyzed.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [email, roleType]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               roleType:
 *                 type: string
 *                 enum: [Candidate, Company]
 *               firstName:
 *                 type: string
 *                 description: Required for Candidate
 *               lastName:
 *                 type: string
 *                 description: Required for Candidate
 *               phone:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Optional PDF resume for Candidates
 *               name:
 *                 type: string
 *                 description: Company display name
 *     responses:
 *       201:
 *         description: User created, OTP sent
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 */
router.post("/register", uploadfile.single('resume'), authController.register);

/**
 * @openapi
 * /auth:
 *   post:
 *     tags: [Auth]
 *     summary: Request login OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: User not found
 */
router.post("/", authController.login);

/**
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and obtain JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful, returns JWT
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-otp", authController.verifyOTP);

/**
 * @openapi
 * /auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: New OTP sent (valid 5 minutes)
 *       404:
 *         description: User not found
 */
router.post("/resend-otp", authController.resendOTP);

// GET /auth/warnUser
// Access: Protected (Authenticated user)
// Description: Notifies/warns the logged-in user (internal use)
router.get("/warnUser", requireAuth, authController.warnUser);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (invalidate session)
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", requireAuth, authController.logout);

/**
 * @openapi
 * /auth/check-role:
 *   get:
 *     tags: [Auth]
 *     summary: Get user role by email
 *     security: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Returns the user's role
 *       404:
 *         description: User not found
 */
router.get("/check-role", authController.checkRole);

module.exports = router;

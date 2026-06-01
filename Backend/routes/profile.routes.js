/**
 * Routes de profil utilisateur et d'entreprise
 *
 * Global applied middlewares:
 * - requireAuth: requires an authenticated user
 * - LogMiddleware("Profile"): logs profile requests
 */
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileControllers/profile.controller');

const { requireAuth } = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware")
const uploadfile = require('../middleware/file-upload.middleware');

// Auth required for all routes below
router.use(requireAuth, authLogMiddleware("Profile"));

/**
 * @openapi
 * /profiles/me:
 *   get:
 *     tags: [Profiles]
 *     summary: Get current user's profile
 *     responses:
 *       200:
 *         description: Current user's profile
 */
router.get('/me', profileController.getMyProfile);

/**
 * @openapi
 * /profiles/createOrUpdateProfile:
 *   post:
 *     tags: [Profiles]
 *     summary: Create or update candidate profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile created or updated
 */
router.post('/createOrUpdateProfile', profileController.createOrUpdateProfile);

/**
 * @openapi
 * /profiles/updateProfileVisibility:
 *   put:
 *     tags: [Profiles]
 *     summary: Update profile visibility (public/private)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isPublicProfile]
 *             properties:
 *               isPublicProfile: { type: boolean }
 *     responses:
 *       200:
 *         description: Visibility updated
 */
router.put('/updateProfileVisibility', profileController.updateProfileVisibility);

/**
 * @openapi
 * /profiles/createOrUpdateCompanyProfile:
 *   post:
 *     tags: [Profiles]
 *     summary: Create or update company profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Company profile created or updated
 */
router.post('/createOrUpdateCompanyProfile', profileController.createOrUpdateCompanyProfile);

/**
 * @openapi
 * /profiles/{userId}:
 *   put:
 *     tags: [Profiles]
 *     summary: Full profile update — fields, image, and/or type
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               user_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 *   get:
 *     tags: [Profiles]
 *     summary: Get a profile by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: Not found
 */
router.put('/:userId', uploadfile.single("user_image"), profileController.updateProfileComplete);
router.get('/:userId', profileController.getProfileById);

module.exports = router;

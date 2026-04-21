/**
 * Routes de profil utilisateur et d'entreprise
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 * - LogMiddleware("Profile"): logs profile requests
 */
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileControllers/profile.controller');

// Import des middlewares
const { requireAuth } = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware")
const uploadfile = require('../middleware/file-upload.middleware');

router.put('/updateFinalBid', profileController.updateFinalBid);


// Auth obligatoire + logs pour toutes les routes
router.use(requireAuth,authLogMiddleware("Profile"));

// GET /profile/getMyProfile — profil de l'utilisateur courant
router.get('/me', profileController.getMyProfile);

// POST /profile/createOrUpdateProfile — creates/updates user profile
router.post('/createOrUpdateProfile',profileController.createOrUpdateProfile);

// PUT /profile/updateProfileVisibility - Update profile visibility (public/private)
router.put('/updateProfileVisibility', profileController.updateProfileVisibility);

// PUT /profile/updateProfileComplete — unified API for all profile updates (fields + image + type)
router.put('/:userId', uploadfile.single("user_image"), profileController.updateProfileComplete);

// POST /profile/createOrUpdateCompanyProfile — creates/updates company profile
router.post('/createOrUpdateCompanyProfile', profileController.createOrUpdateCompanyProfile);

// GET /profile/search/skills — search by skills
router.get('/search/skills', profileController.searchProfilesBySkills);

// POST /profile/addSoftSkills — ajoute des soft skills
router.post('/addSoftSkills', profileController.addSoftSkills);

// GET /profile/getSoftSkills — soft skills courants
router.get('/getSoftSkills',profileController.getSoftSkills);

// GET /profile/getSoftSkillsById/:userId — soft skills par utilisateur
router.get('/getSoftSkillsById/:userId', profileController.getSoftSkills);

router.delete('/deleteHardSkill', profileController.deleteHardSkill);

router.delete('/deleteSoftSkills', profileController.deleteSoftSkill);

router.get('/getCompanyWithAssessments', profileController.getCompanyWithAssessments);

// GET /profiles/:userId — Public route (no auth required) — MUST be LAST to avoid catching other routes
router.get('/:userId', profileController.getProfileById);

module.exports = router;
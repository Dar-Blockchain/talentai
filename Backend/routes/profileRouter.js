/**
 * Routes de profil utilisateur et d'entreprise
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Profile"): journalise les requêtes de profil
 */
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/ProfileControllers/profileController');

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const uploadfile = require('../middleware/uploadfile');

router.put('/updateFinalBid', profileController.updateFinalBid);

// GET /profiles/getProfileById/:userId — Public route (no auth required)
// NOTE: This route must be AFTER all specific routes like /me to avoid matching before them
router.get('/:userId', profileController.getProfileById);

// Auth obligatoire + logs pour toutes les routes
router.use(requireAuthUser,authLogMiddleware("Profile"));

// GET /profile/getMyProfile — profil de l'utilisateur courant (MUST be before catch-all :userId route)
router.get('/me', profileController.getMyProfile);

// POST /profile/createOrUpdateProfile — crée/maj profil utilisateur
router.post('/createOrUpdateProfile',profileController.createOrUpdateProfile);

// PUT /profile/updateProfileVisibility — met à jour la visibilité du profil (public/private)
router.put('/updateProfileVisibility', profileController.updateProfileVisibility);

// PUT /profile/updateProfileComplete — unified API for all profile updates (fields + image + type)
router.put('/', uploadfile.single("user_image"), profileController.updateProfileComplete);

// POST /profile/createOrUpdateCompanyProfile — crée/maj profil entreprise
router.post('/createOrUpdateCompanyProfile', profileController.createOrUpdateCompanyProfile);

// DELETE /profile/deleteProfile — supprime le profil courant
router.delete('/deleteProfile', profileController.deleteProfile);

// GET /profile/search/skills — recherche par compétences
router.get('/search/skills', profileController.searchProfilesBySkills);

// POST /profile/addSoftSkills — ajoute des soft skills
router.post('/addSoftSkills', profileController.addSoftSkills); 

// GET /profile/getSoftSkills — soft skills courants
router.get('/getSoftSkills',profileController.getSoftSkills);

router.get('/getCompanyBid', profileController.getCompanyBids);

// GET /profile/getSoftSkillsById/:userId — soft skills par utilisateur
router.get('/getSoftSkillsById/:userId', profileController.getSoftSkills);

router.delete('/deleteHardSkill', profileController.deleteHardSkill);

router.delete('/deleteSoftSkills', profileController.deleteSoftSkill);

router.get('/getCompanyWithAssessments', profileController.getCompanyWithAssessments);

module.exports = router; 
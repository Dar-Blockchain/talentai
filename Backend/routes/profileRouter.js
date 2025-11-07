/**
 * Routes de profil utilisateur et d'entreprise
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Profile"): journalise les requêtes de profil
 */
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Auth obligatoire + logs pour toutes les routes
//router.use(authLogMiddleware("Profile"));


// POST /profile/createOrUpdateProfile — crée/maj profil utilisateur
router.post('/createOrUpdateProfile', requireAuthUser,profileController.createOrUpdateProfile);

// GET /profile/test-update — test endpoint
router.get('/test-update', profileController.testUpdateProfile);

// PUT /profile/updateProfile — met à jour les champs du profil
router.put('/updateProfile', requireAuthUser, profileController.updateProfile);

// POST /profile/createOrUpdateCompanyProfile — crée/maj profil entreprise
router.post('/createOrUpdateCompanyProfile', requireAuthUser,profileController.createOrUpdateCompanyProfile);

// GET /profile/getMyProfile — profil de l'utilisateur courant
router.get('/getMyProfile', requireAuthUser,profileController.getMyProfile);

// GET /profile/getProfileById/:userId — profil par identifiant utilisateur
router.get('/getProfileById/:userId',requireAuthUser, profileController.getProfileById);

// GET /profile/getAllProfiles — liste de tous les profils
router.get('/getAllProfiles',requireAuthUser, profileController.getAllProfiles);

// DELETE /profile/deleteProfile — supprime le profil courant
router.delete('/deleteProfile',requireAuthUser, profileController.deleteProfile);

// GET /profile/search/skills — recherche par compétences
router.get('/search/skills',requireAuthUser, profileController.searchProfilesBySkills);

// POST /profile/addSoftSkills — ajoute des soft skills
router.post('/addSoftSkills',requireAuthUser, profileController.addSoftSkills); 

// GET /profile/getSoftSkills — soft skills courants
router.get('/getSoftSkills',requireAuthUser, profileController.getSoftSkills);

router.get('/getCompanyBid',requireAuthUser, profileController.getCompanyBids);

// GET /profile/getSoftSkillsById/:userId — soft skills par utilisateur
router.get('/getSoftSkillsById/:userId',requireAuthUser, profileController.getSoftSkills);

router.put('/updateFinalBid',requireAuthUser, profileController.updateFinalBid);

router.delete('/deleteHardSkill',requireAuthUser, profileController.deleteHardSkill);

router.delete('/deleteSoftSkills',requireAuthUser, profileController.deleteSoftSkill);

router.get('/getCompanyWithAssessments',requireAuthUser, profileController.getCompanyWithAssessments);

router.get("/company/stats/total",requireAuthUser, profileController.getTotalCompanies);

router.get("/company/stats/active-posts",requireAuthUser, profileController.getCompaniesWithActivePosts);

router.get("/company/stats/top-hiring",requireAuthUser, profileController.getTopHiringCompanies);

router.get("/company/stats/recent-active",requireAuthUser, profileController.getRecentActiveCompanies);

router.get("/company/stats/top-industries",requireAuthUser, profileController.getTopIndustries);

module.exports = router; 
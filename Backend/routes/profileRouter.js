const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

// Routes protégées par authentification
router.use(requireAuthUser);

// Créer ou mettre à jour un profil
router.post('/createOrUpdateProfile',authLogMiddleware('Profile'), profileController.createOrUpdateProfile);

// Créer ou mettre à jour un profil entreprise
router.post('/createOrUpdateCompanyProfile',authLogMiddleware('Profile'), profileController.createOrUpdateCompanyProfile);

// Récupérer le profil de l'utilisateur connecté
router.get('/getMyProfile',authLogMiddleware('Profile'), profileController.getMyProfile);

// Récupérer un profil par ID utilisateur
router.get('/getProfileById/:userId',authLogMiddleware('Profile'), profileController.getProfileById);

// Récupérer tous les profils
router.get('/getAllProfiles',authLogMiddleware('Profile'), profileController.getAllProfiles);

// Supprimer un profil
router.delete('/deleteProfile',authLogMiddleware('Profile'), profileController.deleteProfile);

// Rechercher des profils par compétences
router.get('/search/skills',authLogMiddleware('Profile'), profileController.searchProfilesBySkills);

// Ajouter des soft skills
router.post('/addSoftSkills',authLogMiddleware('Profile'), profileController.addSoftSkills); 

// Récupérer les soft skills
router.get('/getSoftSkills',authLogMiddleware('Profile'), profileController.getSoftSkills);

router.get('/getCompanyBid',authLogMiddleware('Profile'), profileController.getCompanyBids);

// Récupérer les soft skills par ID
router.get('/getSoftSkillsById/:userId',authLogMiddleware('Profile'), profileController.getSoftSkills);

router.put('/updateFinalBid',authLogMiddleware('Profile'), profileController.updateFinalBid);

router.delete('/deleteHardSkill',authLogMiddleware('Profile'), profileController.deleteHardSkill);

router.delete('/deleteSoftSkills',authLogMiddleware('Profile'), profileController.deleteSoftSkill);

router.get('/getCompanyWithAssessments/:jobId?',authLogMiddleware('Profile'), profileController.getCompanyWithAssessments);

module.exports = router; 
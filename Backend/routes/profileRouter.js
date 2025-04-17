const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

// Créer ou mettre à jour un profil
router.post('/createOrUpdateProfile', profileController.createOrUpdateProfile);

// Créer ou mettre à jour un profil entreprise
router.post('/createOrUpdateCompanyProfile', profileController.createOrUpdateCompanyProfile);

// Récupérer le profil de l'utilisateur connecté
router.get('/getMyProfile', profileController.getMyProfile);

// Récupérer un profil par ID utilisateur
router.get('/getProfileById/:userId', profileController.getProfileById);

// Récupérer tous les profils
router.get('/getAllProfiles', profileController.getAllProfiles);

// Supprimer un profil
router.delete('/deleteProfile', profileController.deleteProfile);

// Rechercher des profils par compétences
router.get('/search/skills', profileController.searchProfilesBySkills);

module.exports = router; 
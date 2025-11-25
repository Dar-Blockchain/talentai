/**
 * Routes de CV (résumés) + intégration NFT Hedera
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Candidate'): réservé aux candidats
 * - LogMiddleware("Resume"): journalise les requêtes liées aux CV
 */
// routes/resumeRoutes.js
const router = require('express').Router();
const resumeController= require('../controllers/resumeController');
const hederaNFTController = require('../controllers/hederaNFTController');

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware


// Auth candidat obligatoire + logs
router.use(requireAuthUser, controledAcces('Candidate'), authLogMiddleware("Resume"));


// CRUD CV
router.post('/createResume', resumeController.createResume);
router.post('/regenerate', resumeController.regenerate);
router.get('/getResumes', resumeController.getResumes);
router.get('/getResume/:id', resumeController.getResumeById);
router.put('/updateResume/:id', resumeController.updateResume);
router.delete('/deleteResume/:id', resumeController.deleteResume);

// Routes Hedera NFT
router.post('/create-nft', hederaNFTController.createResumeNFT);
router.get('/verify-nft/:nftId', hederaNFTController.verifyResumeNFT);
router.get('/nfts/:resumeId', hederaNFTController.getResumeNFTs);

module.exports = router;

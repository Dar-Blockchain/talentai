// routes/resumeRoutes.js
const router = require('express').Router();
const resumeController= require('../controllers/resumeController');
const hederaNFTController = require('../controllers/hederaNFTController');

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware


router.use(requireAuthUser,controledAcces('Candidat'), authLogMiddleware("Resume"));


router.post('/createResume', resumeController.createResume);
router.post('/regenerate', resumeController.regenerate);
router.get('/getResumes', resumeController.getResumes);
router.get('/getResume/:id', resumeController.getResumeById);
router.put('/updateResume/:id', resumeController.updateResume);
router.delete('/deleteResume/:id', resumeController.deleteResume);

// Hedera NFT routes
router.post('/create-nft', hederaNFTController.createResumeNFT);
router.get('/verify-nft/:nftId', hederaNFTController.verifyResumeNFT);
router.get('/nfts/:resumeId', hederaNFTController.getResumeNFTs);

module.exports = router;

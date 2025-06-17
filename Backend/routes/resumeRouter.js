// routes/resumeRoutes.js
const router = require('express').Router();
const resumeController= require('../controllers/resumeController');
const hederaNFTController = require('../controllers/hederaNFTController');
const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

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

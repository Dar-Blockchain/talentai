// routes/resumeRoutes.js
const router = require('express').Router();
const resumeController= require('../controllers/resumeController');
const hederaNFTController = require('../controllers/hederaNFTController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

// Routes protégées par authentification
router.use(requireAuthUser);

router.post('/createResume',authLogMiddleware('resume'), resumeController.createResume);
router.post('/regenerate',authLogMiddleware('resume'), resumeController.regenerate);
router.get('/getResumes',authLogMiddleware('resume'), resumeController.getResumes);
router.get('/getResume/:id',authLogMiddleware('resume'), resumeController.getResumeById);
router.put('/updateResume/:id',authLogMiddleware('resume'), resumeController.updateResume);
router.delete('/deleteResume/:id',authLogMiddleware('resume'), resumeController.deleteResume);

// Hedera NFT routes
router.post('/create-nft', hederaNFTController.createResumeNFT);
router.get('/verify-nft/:nftId', hederaNFTController.verifyResumeNFT);
router.get('/nfts/:resumeId', hederaNFTController.getResumeNFTs);

module.exports = router;

// routes/resumeRoutes.js
const router = require('express').Router();
const resumeController= require('../controllers/resumeController');
const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

router.post('/createResume', resumeController.createResume);
router.get('/getResumes', resumeController.getResumes);
router.get('/getResume/:id', resumeController.getResumeById);
router.put('/updateResume/:id', resumeController.updateResume);
router.delete('/deleteResume/:id', resumeController.deleteResume);
module.exports = router;

// routes/resumeRoutes.js
const router = require('express').Router();
const { createResume } = require('../controllers/resumeController');

router.post('/createResume', createResume);
module.exports = router;

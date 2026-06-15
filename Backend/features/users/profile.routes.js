const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');

const { requireAuth } = require('../../middleware/security/auth.middleware');
const authLogMiddleware = require("../../middleware/security/request-log.middleware");
const uploadfile       = require('../../middleware/file-upload.middleware');
const uploadResume     = require('../../middleware/fileResume-upload.middleware');

// Auth required for all routes below
router.use(requireAuth, authLogMiddleware("Profile"));

router.get('/me', profileController.getMyProfile);
router.get('/:userId', profileController.getProfileById);
router.put('/:userId', uploadfile.single("user_image"), profileController.updateProfile);

router.put('/update-resume', uploadResume.single('resume'), profileController.updateResume);
router.delete('/delete-resume', profileController.deleteResume);

module.exports = router;

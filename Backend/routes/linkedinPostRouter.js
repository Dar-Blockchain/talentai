const express = require("express");
const router = express.Router();
const linkedinPostController = require("../controllers/linkedinPostController");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

const { requireAuthUser } = require("../middleware/authMiddleware");

// Routes protégées par authentification
router.use(requireAuthUser);

router.post("/generate-job-post",authLogMiddleware('Linkedin'), linkedinPostController.generateJobPost);

module.exports = router;

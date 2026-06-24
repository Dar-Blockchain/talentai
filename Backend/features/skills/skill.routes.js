const express    = require("express");
const router     = express.Router();
const controller = require("./skill.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");

router.use(requireAuth);

// GET /skills              — authenticated user's own skills
router.get("/", controller.getMySkills);

module.exports = router;

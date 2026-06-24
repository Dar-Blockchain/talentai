const express    = require("express");
const router     = express.Router();
const controller = require("./skill.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");

router.use(requireAuth);

// GET /skills              — authenticated user's own skills
router.get("/", controller.getMySkills);

// GET /skills/profile/:profileId — skills for a specific profile
router.get("/profile/:profileId", controller.getSkillsByProfile);

module.exports = router;

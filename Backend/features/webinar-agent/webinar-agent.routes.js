const express    = require("express");
const router     = express.Router();
const controller = require("./webinar-agent.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");

// Public routes — called from the landing page (no auth required)
router.post("/progress",              controller.saveProgress);
router.get( "/progress/:submissionId", controller.getProgress);
router.post("/complete/:submissionId", controller.complete);

// Admin route — replay failed fan-outs
router.post("/admin/replay-failed", requireAuth, controller.replayFailed);

module.exports = router;

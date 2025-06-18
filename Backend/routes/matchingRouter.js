const express = require("express");
const { matchCandidatesToJob } = require("../controllers/matchingController");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

const router = express.Router();
router.get("/jobs/:jobPostId/matches",authLogMiddleware('matching'), matchCandidatesToJob);
module.exports = router;

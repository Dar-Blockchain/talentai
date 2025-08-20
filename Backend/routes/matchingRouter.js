const express = require("express");
const { matchCandidatesToJob } = require("../controllers/matchingController");

const router = express.Router();
router.get("/jobs/:jobPostId/matches", matchCandidatesToJob);
module.exports = router;

const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/authMiddleware");
const interviewDetailsController = require("../controllers/interviewDetailsController");

router.use(requireAuthUser);

router.get("/", interviewDetailsController.getAll);

module.exports = router;

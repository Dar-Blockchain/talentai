const express = require("express");

const router = express.Router();
const imageController = require("../controllers/imageController");

// Move the logic to imageService and call it from the controller
router.get("/:image", imageController.getImage);

module.exports = router;

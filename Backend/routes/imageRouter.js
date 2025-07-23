const express = require("express");

const router = express.Router();
const imageController = require("../controllers/imageController");

router.get("/:image", imageController.getImage);

module.exports = router;

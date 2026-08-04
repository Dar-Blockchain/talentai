const express = require("express");
const router = express.Router();
const SystemController = require("./system.controller");

router.get("/version", SystemController.getVersion);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getVersion } = require("./system.controller");

router.get("/version", getVersion);

module.exports = router;
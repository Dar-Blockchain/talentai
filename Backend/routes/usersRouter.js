const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { requireAuthUser } = require("../middleware/authMiddleware");

router.get("/getAllUsers", usersController.getAllUsers);


module.exports = router;
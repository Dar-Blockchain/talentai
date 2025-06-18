const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

router.get("/getAllUsers", requireAuthUser,authLogMiddleware('Dhasbord'), usersController.getAllUsers);


module.exports = router;
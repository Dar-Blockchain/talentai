const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

const { requireAuthUser } = require("../middleware/authMiddleware");
router.use(requireAuthUser);

router.post("/profile",authLogMiddleware('todo'), todoController.generateTodoListForProfile);
router.get("/profile",authLogMiddleware('todo'), todoController.getTodoListOfProfile);

module.exports = router;

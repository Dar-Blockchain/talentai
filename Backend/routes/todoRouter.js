const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); 


router.use(requireAuthUser,controledAcces('Candidat'), authLogMiddleware("Todo"));


router.post("/profile", todoController.generateTodoListForProfile);
router.get("/profile", todoController.getTodoListOfProfile);

module.exports = router;

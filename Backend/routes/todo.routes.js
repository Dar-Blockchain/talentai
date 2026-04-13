/**
 * Todo task lists routes linked to profile
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 * - controledAcces('Candidate'): reserved for candidates
 * - LogMiddleware("Todo"): logs todo requests
 */
const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");

// Import des middlewares
const { requireAuth } = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); 


// Auth candidat obligatoire + logs
router.use(requireAuth, controledAcces('Candidate'), authLogMiddleware("Todo"));


// POST /todo/profile — generates a todo list for user profile
router.post("/profile", todoController.generateTodoListForProfile);
// GET /todo/profile — retrieves the user profile todo list
router.get("/profile", todoController.getTodoListOfProfile);

module.exports = router;

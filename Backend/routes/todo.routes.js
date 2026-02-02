/**
 * Routes de listes de tâches (todo) liées au profil
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Candidate'): réservé aux candidats
 * - LogMiddleware("Todo"): journalise les requêtes todo
 */
const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");

// Import des middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); 


// Auth candidat obligatoire + logs
router.use(requireAuthUser, controledAcces('Candidate'), authLogMiddleware("Todo"));


// POST /todo/profile — génère une todo list pour le profil de l'utilisateur
router.post("/profile", todoController.generateTodoListForProfile);
// GET /todo/profile — récupère la todo list du profil de l'utilisateur
router.get("/profile", todoController.getTodoListOfProfile);

module.exports = router;

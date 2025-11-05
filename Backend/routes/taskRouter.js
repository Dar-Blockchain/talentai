/**
 * Routes for task management
 * 
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Task"): journalise les requêtes liées aux tâches
 */
const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");
const taskController = require("../controllers/taskController");

// Auth obligatoire + logs pour toutes les routes
router.use(requireAuthUser);
//router.use(requireAuthUser, authLogMiddleware("Task"));

// POST /task/send-task
// Description: Send technical test task via email with PDF
router.post("/send-task", taskController.sendTask);

// GET /task/test-email
// Description: Test email configuration
router.get("/test-email", taskController.testEmail);

module.exports = router;

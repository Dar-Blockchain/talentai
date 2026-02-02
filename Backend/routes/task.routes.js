/**
 * Routes for task management
 * 
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Task"): journalise les requêtes liées aux tâches
 */
const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const taskController = require("../controllers/task.controller");

// Auth obligatoire + logs pour toutes les routes
router.use(requireAuthUser, authLogMiddleware("Task"));

// POST /task/send-task
// Description: Send technical test task via email with PDF
router.post("/send-task", taskController.sendTask);

// GET /task/test-email
// Description: Test email configuration
router.get("/test-email", taskController.testEmail);

module.exports = router;

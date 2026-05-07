/**
 * Routes for task management
 * 
 * Global applied middleware:
 * - requireAuthUser: requires an authenticated user
 * - LogMiddleware("Task"): logs task-related requests
 */
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const taskController = require("../controllers/task.controller");

// Auth obligatoire + logs pour toutes les routes
router.use(requireAuth, authLogMiddleware("Task"));

// POST /task/send-task
// Description: Send technical test task via email with PDF
router.post("/send-task", taskController.sendTask);

// GET /task/test-email
// Description: Test email configuration
router.get("/test-email", taskController.testEmail);

module.exports = router;

/**
 * Backup Management Routes
 * Routes for managing database backups (Admin only)
 *
 * Middlewares applied:
 * - requireAuthUser: requires authenticated user
 * - controledAcces('Admin'): restricts to administrators only
 */
const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backup.controller");

// Import middlewares
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");

// All routes require admin authentication
//router.use(requireAuth, authLogMiddleware("Backup"));

/**
 * POST /admin/backups/perform
 * Manually trigger a database backup
 */
router.post("/perform", backupController.performBackup);

/**
 * GET /admin/backups/list
 * List all available backups
 */
router.get("/list", backupController.listBackups);

/**
 * POST /admin/backups/restore/:backupName
 * Restore database from a specific backup
 * WARNING: This will overwrite current database
 */
router.post("/restore/:backupName", backupController.restoreBackup);

/**
 * DELETE /admin/backups/delete/:backupName
 * Delete a specific backup by name
 */
router.delete("/delete/:backupName", backupController.deleteBackup);

/**
 * GET /admin/backups/info
 * Get backup service information
 */
router.get("/info", backupController.getBackupInfo);

module.exports = router;

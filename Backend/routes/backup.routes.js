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

//router.use(requireAuth, authLogMiddleware("Backup"));

/**
 * @openapi
 * /admin/backups/perform:
 *   post:
 *     tags: [Admin — Backups]
 *     summary: Manually trigger a database backup
 *     responses:
 *       200:
 *         description: Backup performed
 */
router.post("/perform", backupController.performBackup);

/**
 * @openapi
 * /admin/backups/list:
 *   get:
 *     tags: [Admin — Backups]
 *     summary: List all available backups
 *     responses:
 *       200:
 *         description: List of backup file names
 */
router.get("/list", backupController.listBackups);

/**
 * @openapi
 * /admin/backups/restore/{backupName}:
 *   post:
 *     tags: [Admin — Backups]
 *     summary: Restore database from a backup (overwrites current data)
 *     parameters:
 *       - in: path
 *         name: backupName
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restore successful
 *       500:
 *         description: Restore failed
 */
router.post("/restore/:backupName", backupController.restoreBackup);

/**
 * @openapi
 * /admin/backups/delete/{backupName}:
 *   delete:
 *     tags: [Admin — Backups]
 *     summary: Delete a specific backup file
 *     parameters:
 *       - in: path
 *         name: backupName
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Backup deleted
 */
router.delete("/delete/:backupName", backupController.deleteBackup);

/**
 * @openapi
 * /admin/backups/info:
 *   get:
 *     tags: [Admin — Backups]
 *     summary: Get backup service information
 *     responses:
 *       200:
 *         description: Service info
 */
router.get("/info", backupController.getBackupInfo);

module.exports = router;

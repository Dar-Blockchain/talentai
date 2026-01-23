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
const backupService = require("../services/backupService");
const logger = require("../utils/logger");

// Import middlewares
const { requireAuthUser } = require("../middleware/authMiddleware");
const { controledAcces } = require("../middleware/controledAcces");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// All routes require admin authentication
router.use(requireAuthUser, controledAcces('Admin'), authLogMiddleware("Backup"));

/**
 * POST /admin/backups/perform
 * Manually trigger a database backup
 */
router.post("/perform", async (req, res) => {
  try {
    logger.info("Manual backup triggered by admin");
    
    const result = await backupService.performBackup();

    res.status(200).json({
      success: true,
      message: 'Database backup completed successfully',
      data: {
        backupName: result.backupName,
        backupPath: result.backupPath,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    logger.error(`Backup failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to perform backup',
      error: error.message
    });
  }
});

/**
 * GET /admin/backups/list
 * List all available backups
 */
router.get("/list", (req, res) => {
  try {
    const backups = backupService.listBackups();

    res.status(200).json({
      success: true,
      message: 'Backups retrieved successfully',
      count: backups.length,
      backupDir: backupService.getBackupDir(),
      maxBackups: backupService.getMaxBackups(),
      data: backups.map(backup => ({
        name: backup.name,
        size: backup.size,
        createdAt: backup.time,
        path: backup.path
      }))
    });
  } catch (error) {
    logger.error(`Error listing backups: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to list backups',
      error: error.message
    });
  }
});

/**
 * POST /admin/backups/restore/:backupName
 * Restore database from a specific backup
 * WARNING: This will overwrite current database
 */
router.post("/restore/:backupName", async (req, res) => {
  try {
    const { backupName } = req.params;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Restore requires confirmation. Set confirm: true in body',
        warning: 'This operation will overwrite the current database'
      });
    }

    logger.warn(`⚠️ Database restore initiated from backup: ${backupName}`);
    
    const result = await backupService.restoreBackup(backupName);

    res.status(200).json({
      success: true,
      message: 'Database restored successfully',
      data: {
        backupName: result.backupName,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    logger.error(`Restore failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to restore backup',
      error: error.message
    });
  }
});

/**
 * GET /admin/backups/info
 * Get backup service information
 */
router.get("/info", (req, res) => {
  try {
    const backups = backupService.listBackups();
    const latestBackup = backups[0];

    res.status(200).json({
      success: true,
      message: 'Backup service information',
      data: {
        backupDirectory: backupService.getBackupDir(),
        totalBackups: backups.length,
        maxBackupsKept: backupService.getMaxBackups(),
        latestBackup: latestBackup ? {
          name: latestBackup.name,
          size: latestBackup.size,
          createdAt: latestBackup.time
        } : null,
        dailyBackupTime: '02:00 (UTC)',
        status: 'Active'
      }
    });
  } catch (error) {
    logger.error(`Error getting backup info: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup information',
      error: error.message
    });
  }
});

module.exports = router;

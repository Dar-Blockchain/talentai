const backupService = require("../services/backup.service");
const logger = require("../utils/logger");

/**
 * Centralized error handler for backup operations
 */
const handleError = (res, error, defaultStatus = 500) => {
  logger.error(`Backup controller error: ${error?.message || error}`);
  const status = error?.status || defaultStatus;
  res.status(status).json({
    success: false,
    message: error?.message || "Internal server error",
    error: error?.message || "Unknown error"
  });
};

/**
 * POST /admin/backups/perform
 * Manually trigger a database backup
 */
module.exports.performBackup = async (req, res) => {
  try {
    logger.info("Manual backup triggered by admin");

    const result = await backupService.performBackup();

    res.status(200).json({
      success: true,
      message: 'Database backup completed successfully',
      data: {
        backupName: result.backupName,
        backupPath: result.backupPath,
        timestamp: result.timestamp,
        method: result.method
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET /admin/backups/list
 * List all available backups
 */
module.exports.listBackups = (req, res) => {
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
    handleError(res, error);
  }
};

/**
 * POST /admin/backups/restore/:backupName
 * Restore database from a specific backup
 * WARNING: This will overwrite current database
 */
module.exports.restoreBackup = async (req, res) => {
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
    handleError(res, error);
  }
};

/**
 * DELETE /admin/backups/delete/:backupName
 * Delete a specific backup by name
 */
module.exports.deleteBackup = (req, res) => {
  try {
    const { backupName } = req.params;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Delete requires confirmation. Set confirm: true in body',
        warning: 'This operation will permanently remove the backup'
      });
    }

    const result = backupService.deleteBackup(backupName);

    res.status(200).json({
      success: true,
      message: 'Backup deleted successfully',
      data: {
        backupName: result.backupName,
        backupPath: result.backupPath
      }
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET /admin/backups/info
 * Get backup service information
 */
module.exports.getBackupInfo = (req, res) => {
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
    handleError(res, error);
  }
};
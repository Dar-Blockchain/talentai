// cron/daily-backup.js
const logger = require('../utils/logger');
const backupService = require('../services/backup.service');
const cron = require('node-cron');

function initialize() {
  cron.schedule('0 2 * * 0', async () => { // 2:00 AM every Sunday
    try {
      logger.header('⏰ Weekly Backup CRON Job Started');
      const result = await backupService.performBackup();
      logger.success(`✅ Weekly backup completed: ${result.backupName}`);
      logger.info(`Backup location: ${result.backupPath}`);
      const backups = backupService.listBackups();
      logger.info(`📊 Total backups available: ${backups.length}`);
    } catch (error) {
      logger.error(`❌ Weekly backup failed: ${error.message}`);
      // TODO: email notification
    }
  });
}

module.exports = { initialize };

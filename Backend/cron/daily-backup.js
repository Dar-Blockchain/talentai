// cron/daily-backup.js
const logger = require('../utils/logger');
const backupService = require('../services/backupService');
const cron = require('node-cron');

function initialize() {
  cron.schedule('0 2 * * *', async () => { // 2:00 AM daily
    try {
      logger.header('⏰ Daily Backup CRON Job Started');
      const result = await backupService.performBackup();
      logger.success(`✅ Daily backup completed: ${result.backupName}`);
      logger.info(`Backup location: ${result.backupPath}`);
      const backups = backupService.listBackups();
      logger.info(`📊 Total backups available: ${backups.length}`);
    } catch (error) {
      logger.error(`❌ Daily backup failed: ${error.message}`);
      // TODO: email notification
    }
  });
}

module.exports = { initialize };

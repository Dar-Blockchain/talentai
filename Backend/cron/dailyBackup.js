const logger = require('../../utils/logger');
const backupService = require('../backupService');

/**
 * Daily Database Backup CRON Job
 * Runs every day at 2:00 AM
 */

const scheduleDailyBackup = async (agenda) => {
  try {
    // Define the daily backup job
    agenda.define('daily-database-backup', async (job) => {
      try {
        logger.header('⏰ Daily Backup CRON Job Started');
        logger.info(`Execution time: ${new Date().toISOString()}`);
        
        // Perform backup
        const result = await backupService.performBackup();
        
        logger.success(`✅ Daily backup completed: ${result.backupName}`);
        logger.info(`Backup location: ${result.backupPath}`);
        
        // Log backup info
        const backups = backupService.listBackups();
        logger.info(`📊 Total backups available: ${backups.length}`);
        
      } catch (error) {
        logger.error(`❌ Daily backup failed: ${error.message}`);
        
        // Send alert or notification if needed
        // TODO: Implement email notification for failed backups
      }
    });

    // Schedule the job to run daily at 2:00 AM
    await agenda.every('0 2 * * *', 'daily-database-backup');
    
    logger.success('✅ Daily backup CRON job scheduled to run at 2:00 AM');
    
  } catch (error) {
    logger.error(`Failed to schedule daily backup: ${error.message}`);
  }
};

module.exports = {
  scheduleDailyBackup
};

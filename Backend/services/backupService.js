const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const logger = require('../utils/logger');
const moment = require('moment');

const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 7; // Garder les 7 derniers backups
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentai';

/**
 * Initialize backup directory if it doesn't exist
 */
const initializeBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    logger.info(`📁 Backup directory created: ${BACKUP_DIR}`);
  }
};

/**
 * Get database name from MongoDB URI
 */
const getDatabaseName = () => {
  try {
    const url = new URL(MONGODB_URI);
    const dbName = url.pathname.split('/').filter(Boolean)[0];
    return dbName || 'talentai';
  } catch (error) {
    logger.warn('Could not parse database name from URI, using default: talentai');
    return 'talentai';
  }
};

/**
 * Perform database backup using mongodump
 */
const performBackup = async () => {
  return new Promise((resolve, reject) => {
    try {
      initializeBackupDir();

      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const backupName = `backup_${timestamp}`;
      const backupPath = path.join(BACKUP_DIR, backupName);
      const dbName = getDatabaseName();

      logger.section(`📦 Starting database backup...`);
      logger.info(`Database: ${dbName}`);
      logger.info(`Backup path: ${backupPath}`);

      // mongodump command
      const command = `mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Backup failed: ${error.message}`);
          return reject(error);
        }

        logger.success(`✅ Backup completed successfully`);
        logger.info(`Backup size: ${getDirectorySize(backupPath)}`);
        
        // Clean up old backups
        cleanupOldBackups();
        
        resolve({
          success: true,
          backupName,
          backupPath,
          timestamp
        });
      });
    } catch (error) {
      logger.error(`Backup error: ${error.message}`);
      reject(error);
    }
  });
};

/**
 * Get directory size in human readable format
 */
const getDirectorySize = (dirPath) => {
  try {
    let size = 0;
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    files.forEach(file => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        size += getDirectorySizeRecursive(filePath);
      } else {
        size += fs.statSync(filePath).size;
      }
    });

    return formatBytes(size);
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Recursively get directory size
 */
const getDirectorySizeRecursive = (dirPath) => {
  let size = 0;
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach(file => {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      size += getDirectorySizeRecursive(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  });

  return size;
};

/**
 * Format bytes to human readable format
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Clean up old backups, keeping only the most recent ones
 */
const cleanupOldBackups = () => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => fs.statSync(path.join(BACKUP_DIR, file)).isDirectory())
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (backups.length > MAX_BACKUPS) {
      const backupsToDelete = backups.slice(MAX_BACKUPS);

      backupsToDelete.forEach(backup => {
        try {
          deleteDirectoryRecursive(backup.path);
          logger.info(`🗑️ Deleted old backup: ${backup.name}`);
        } catch (error) {
          logger.warn(`Failed to delete backup ${backup.name}: ${error.message}`);
        }
      });

      logger.info(`📊 Backup cleanup complete. Kept ${MAX_BACKUPS} recent backups`);
    }
  } catch (error) {
    logger.warn(`Backup cleanup error: ${error.message}`);
  }
};

/**
 * Recursively delete directory and its contents
 */
const deleteDirectoryRecursive = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectoryRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

/**
 * List all available backups
 */
const listBackups = () => {
  try {
    initializeBackupDir();

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => fs.statSync(path.join(BACKUP_DIR, file)).isDirectory())
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        size: formatBytes(getDirectorySizeRecursive(path.join(BACKUP_DIR, file))),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    return backups;
  } catch (error) {
    logger.error(`Error listing backups: ${error.message}`);
    return [];
  }
};

/**
 * Restore database from backup using mongorestore
 */
const restoreBackup = async (backupName) => {
  return new Promise((resolve, reject) => {
    try {
      const backupPath = path.join(BACKUP_DIR, backupName);

      if (!fs.existsSync(backupPath)) {
        return reject(new Error(`Backup not found: ${backupName}`));
      }

      logger.section(`📥 Starting database restore from ${backupName}...`);

      // mongorestore command
      const command = `mongorestore --uri="${MONGODB_URI}" --dir="${backupPath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Restore failed: ${error.message}`);
          return reject(error);
        }

        logger.success(`✅ Restore completed successfully from ${backupName}`);
        
        resolve({
          success: true,
          backupName,
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
        });
      });
    } catch (error) {
      logger.error(`Restore error: ${error.message}`);
      reject(error);
    }
  });
};

/**
 * Initialize automated daily backup
 */
const initializeDailyBackup = async () => {
  try {
    initializeBackupDir();
    
    // Perform initial backup on startup
    logger.info('🔄 Performing initial database backup on startup...');
    await performBackup();
    
    logger.success('Daily backup service initialized');
    return true;
  } catch (error) {
    logger.error(`Failed to initialize backup service: ${error.message}`);
    return false;
  }
};

module.exports = {
  performBackup,
  initializeDailyBackup,
  listBackups,
  restoreBackup,
  getBackupDir: () => BACKUP_DIR,
  getMaxBackups: () => MAX_BACKUPS
};

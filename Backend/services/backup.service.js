const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const logger = require('../utils/logger');
const moment = require('moment');
const mongoose = require('mongoose');

const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 7; // Garder les 7 derniers backups
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentai';
const MONGODB_TOOLS_PATH = 'C:\\mongodb-tools\\mongodb-database-tools-windows-x86_64-100.9.4\\bin';

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
 * Perform database backup using mongodump (primary method) or alternative method
 */
const performBackup = async () => {
  try {
    // Try primary method first (mongodump)
    return await performBackupPrimary();
  } catch (error) {
    logger.warn(`Primary backup method failed: ${error.message}. Trying alternative method...`);
    // Fallback to alternative method
    return await performBackupAlternative();
  }
};

/**
 * Perform database backup using mongodump (primary method)
 */
const performBackupPrimary = async () => {
  return new Promise((resolve, reject) => {
    try {
      initializeBackupDir();

      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const backupName = `backup_${timestamp}`;
      const backupPath = path.join(BACKUP_DIR, backupName);
      const dbName = getDatabaseName();

      logger.section(`📦 Starting database backup (primary method)...`);
      logger.info(`Database: ${dbName}`);
      logger.info(`Backup path: ${backupPath}`);

      // mongodump command using updated MongoDB tools
      const command = `"${MONGODB_TOOLS_PATH}\\mongodump.exe" --uri="${MONGODB_URI}" --out="${backupPath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error(`Primary backup failed: ${error.message}`);
          return reject(error);
        }

        logger.success(`✅ Primary backup completed successfully`);
        logger.info(`Backup size: ${getDirectorySize(backupPath)}`);

        // Clean up old backups
        cleanupOldBackups();

        resolve({
          success: true,
          backupName,
          backupPath,
          timestamp,
          method: 'primary'
        });
      });
    } catch (error) {
      logger.error(`Primary backup error: ${error.message}`);
      reject(error);
    }
  });
};

/**
 * Perform database backup using Mongoose (alternative method for Atlas compatibility)
 */
const performBackupAlternative = async () => {
  try {
    initializeBackupDir();

    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const backupName = `backup_${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    logger.section(`📦 Starting alternative database backup...`);
    logger.info(`Backup path: ${backupPath}`);

    // Connect to MongoDB using Mongoose
    await mongoose.connect(MONGODB_URI);

    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // Create backup directory
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Export each collection to JSON
    for (const collection of collections) {
      const collectionName = collection.name;
      logger.info(`Exporting collection: ${collectionName}`);

      const collectionData = await db.collection(collectionName).find({}).toArray();

      // Write to JSON file
      const filePath = path.join(backupPath, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(collectionData, null, 2));
    }

    // Disconnect
    await mongoose.disconnect();

    logger.success(`✅ Alternative backup completed successfully`);
    logger.info(`Backup size: ${getDirectorySize(backupPath)}`);

    // Clean up old backups
    cleanupOldBackups();

    return {
      success: true,
      backupName,
      backupPath,
      timestamp,
      method: 'alternative'
    };
  } catch (error) {
    logger.error(`Alternative backup error: ${error.message}`);
    throw error;
  }
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
 * Delete a specific backup directory
 */
const deleteBackup = (backupName) => {
  try {
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath) || !fs.statSync(backupPath).isDirectory()) {
      throw new Error(`Backup not found: ${backupName}`);
    }

    deleteDirectoryRecursive(backupPath);
    logger.info(`🗑️ Backup deleted: ${backupName}`);

    return {
      success: true,
      backupName,
      backupPath
    };
  } catch (error) {
    logger.error(`Delete backup failed: ${error.message}`);
    throw error;
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

      // mongorestore command using updated MongoDB tools
      const command = `"${MONGODB_TOOLS_PATH}\\mongorestore.exe" --uri="${MONGODB_URI}" --dir="${backupPath}"`;

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
  deleteBackup,
  getBackupDir: () => BACKUP_DIR,
  getMaxBackups: () => MAX_BACKUPS
};

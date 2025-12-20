/**
 * Centralized Logger Utility
 * Provides structured logging with timestamps and colors
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

const getTimestamp = () => {
  return new Date().toISOString().split('T')[1].split('Z')[0]; // HH:MM:SS
};

const logger = {
  /**
   * Log informational message
   */
  info: (message, data = '') => {
    console.log(`${colors.blue}[${getTimestamp()}] ℹ️  ${message}${colors.reset}`, data);
  },

  /**
   * Log success message
   */
  success: (message, data = '') => {
    console.log(`${colors.green}[${getTimestamp()}] ✅ ${message}${colors.reset}`, data);
  },

  /**
   * Log warning message
   */
  warn: (message, data = '') => {
    console.warn(`${colors.yellow}[${getTimestamp()}] ⚠️  ${message}${colors.reset}`, data);
  },

  /**
   * Log error message
   */
  error: (message, data = '') => {
    console.error(`${colors.red}[${getTimestamp()}] ❌ ${message}${colors.reset}`, data);
  },

  /**
   * Log debug message
   */
  debug: (message, data = '') => {
    if (process.env.DEBUG === 'true') {
      console.log(`${colors.gray}[${getTimestamp()}] 🐛 ${message}${colors.reset}`, data);
    }
  },

  /**
   * Log header (with decorative lines)
   */
  header: (message) => {
    console.log('');
    console.log(`${colors.bright}${colors.green}🎉 ${message}${colors.reset}`);
    console.log('');
  },

  /**
   * Log section
   */
  section: (message) => {
    console.log(`${colors.bright}${colors.blue}▶ ${message}${colors.reset}`);
  },
};

module.exports = logger;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

const isDevelopment = process.env.NODE_ENV !== 'production';

const getTimestamp = () => new Date().toISOString().split('T')[1].split('Z')[0];

const logger = {
  info:    (message) => console.log(`\x1b[36m[${getTimestamp()}] ℹ️  ${message}\x1b[0m`),
  success: (message) => console.log(`\x1b[32m[${getTimestamp()}] ✅ ${message}\x1b[0m`),
  debug:   () => {},
  header:  () => {},
  section: () => {},

  warn: (message, data = '') => {
    if (isDevelopment) {
      console.warn(`${colors.yellow}[${getTimestamp()}] ⚠️  ${message}${colors.reset}`, data);
    }
  },

  error: (message, data = '') => {
    if (isDevelopment) {
      console.error(`${colors.red}[${getTimestamp()}] ❌ ${message}${colors.reset}`, data);
    }
  },
};

module.exports = logger;

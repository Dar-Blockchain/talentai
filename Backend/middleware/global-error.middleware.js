/**
 * Global Error Handler Middleware
 * Centralizes error handling across the application
 */

const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Should be registered LAST after all other middleware and routes
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(`[${req.method} ${req.path}] ${message}`);

  // Don't expose error details in production
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (!isProduction) {
    response.error = err;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.path}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

/**
 * Middleware Configuration
 * Centralized middleware setup
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

/**
 * Register all middlewares on the Express app
 * @param {Express} app - Express application instance
 */
function registerMiddlewares(app) {
  // JSON & URL-encoded body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS Configuration
  app.use(
    cors({
      origin: '*', // Allow all origins (adjust for production)
      methods: 'GET, POST, PUT, DELETE, PATCH',
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      credentials: true,
    })
  );

  // Static files
  app.use(express.static(path.join(__dirname, '../public')));

  // Request logging
  app.use(logger('dev'));

  // Cookie parsing
  app.use(cookieParser());
}

module.exports = {
  registerMiddlewares
};

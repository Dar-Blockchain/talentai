const mongoose = require('mongoose');
const dbMonitor = require('../utils/dbMonitor');

const connectDB = async () => {
  // Validate environment configuration first
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }
  try {
    // Optimized connection options for better performance
    const connectionOptions = {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5,  // Minimum number of connections in the pool
      
      // Timeout settings
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a response
      connectTimeoutMS: 10000, // How long to wait for initial connection
      
      // Heartbeat and monitoring
      heartbeatFrequencyMS: 10000, // How often to check server status
      
      // Buffer settings (using supported options for Mongoose 8.x)
      bufferCommands: false, // Disable mongoose buffering
      
      // Other optimizations
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection Pool - Min: ${connectionOptions.minPoolSize}, Max: ${connectionOptions.maxPoolSize}`);
    
    // Initialize performance monitoring (delayed to avoid startup noise)
    setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        dbMonitor.enableQueryLogging();
      }
      dbMonitor.monitorConnectionPool();
      
      // Log performance summary every 5 minutes
      setInterval(() => {
        dbMonitor.logPerformanceSummary();
      }, 300000);
    }, 5000); // Delay monitoring setup by 5 seconds
    
    // Connection event listeners for monitoring
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    console.error('Connection details:', {
      uri: process.env.MONGODB_URI ? 'URI provided' : 'URI missing',
      error: error.name
    });
    process.exit(1);
  }
};

module.exports = connectDB; 
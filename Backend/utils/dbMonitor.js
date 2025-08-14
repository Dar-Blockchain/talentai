const mongoose = require('mongoose');

class DatabaseMonitor {
  constructor() {
    this.slowQueryThreshold = 100; // milliseconds
    this.queryStats = {
      total: 0,
      slow: 0,
      errors: 0
    };
  }

  // Enable mongoose query logging for performance monitoring
  enableQueryLogging() {
    mongoose.set('debug', (collection, method, query, doc, options) => {
      const startTime = Date.now();
      
      // Log slow queries
      process.nextTick(() => {
        const duration = Date.now() - startTime;
        this.queryStats.total++;
        
        if (duration > this.slowQueryThreshold) {
          this.queryStats.slow++;
          console.warn(`⚠️ Slow Query (${duration}ms):`, {
            collection,
            method,
            query: JSON.stringify(query),
            duration: `${duration}ms`
          });
        }
      });
    });
  }

  // Monitor connection pool status
  monitorConnectionPool() {
    setInterval(() => {
      const db = mongoose.connection.db;
      if (db) {
        const poolInfo = {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        };
        
        // Log pool status every 30 seconds in development
        if (process.env.NODE_ENV === 'development') {
        //  console.log('📊 DB Pool Status:', poolInfo);
        }
      }
    }, 30000); // Every 30 seconds
  }

  // Get performance statistics
  getStats() {
    return {
      ...this.queryStats,
      slowQueryPercentage: this.queryStats.total > 0 
        ? ((this.queryStats.slow / this.queryStats.total) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  // Log performance summary
  logPerformanceSummary() {
  //  console.log('📈 Database Performance Summary:', this.getStats());
  }
}

// Export singleton instance
const dbMonitor = new DatabaseMonitor();

module.exports = dbMonitor;
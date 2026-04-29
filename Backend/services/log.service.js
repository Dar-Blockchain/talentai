const Log = require('../models/Log.model');  // Import Log model

// Function to retrieve all logs
module.exports.getAllLogs = async (options = {}) => {
  try {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
    const filters = options.filters || {};

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find(filters).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Log.countDocuments(filters),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error('Error retrieving logs');
  }
};

// Function to retrieve total log count
module.exports.getTotalLogsCount = async () => {
  try {
    const count = await Log.getTotalLogsCount();  // Use static method defined in model
    return count;
  } catch (error) {
    throw new Error('Error retrieving total log count');
  }
};

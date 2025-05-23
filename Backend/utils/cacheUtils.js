const crypto = require('crypto');

// Generate a consistent cache key using a hash of the input data
const generateCacheKey = (prefix, data) => {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
};

// Safely serialize data before caching
const serializeCacheData = (data) => {
  return JSON.stringify(data);
};

// Safely deserialize data from cache
const deserializeCacheData = (data) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Cache deserialization error:', err);
    return null;
  }
};

module.exports = {
  generateCacheKey,
  serializeCacheData,
  deserializeCacheData,
};

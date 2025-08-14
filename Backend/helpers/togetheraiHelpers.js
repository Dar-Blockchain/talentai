const Together = require('together-ai');  // Use require instead of import
require('dotenv').config();

const together = new Together(); // Auth using API key in process.env.TOGETHER_API_KEY
module.exports.callTogetherAIWithTimeout = async (params, label) => {
    const timeoutMs = 30000; // 30 seconds
    return Promise.race([
        together.chat.completions.create(params),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Together AI timeout for ${label}`)), timeoutMs))
    ]);
};
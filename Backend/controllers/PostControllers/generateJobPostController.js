const generateJobPostService = require("../../services/PosteServices/generateJobPostService");

// Controller: wrapper with input validation and timeout
module.exports.generateJobPost = async (req, res) => {
  try {
    let { description, type = "detailed" } = req.body || {};
    const user = req.user;

    // Basic validations
    if (typeof description !== "string") {
      return res.status(400).json({ error: "Missing or invalid job description" });
    }

    description = description.trim();
    if (!description) {
      return res.status(400).json({ error: "Job description is empty after trimming" });
    }

    // Limit description length to avoid huge prompts
    const MAX_DESCRIPTION_LENGTH = 50_000; // characters
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({ error: `Job description too long (max ${MAX_DESCRIPTION_LENGTH} chars)` });
    }

    // Validate type
    const allowedTypes = new Set(["quick", "detailed"]);
    if (typeof type !== "string" || !allowedTypes.has(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed: ${[...allowedTypes].join(', ')}` });
    }

    // Call service with a timeout to avoid hanging requests
    const TIMEOUT_MS = 30_000; // 30 seconds

    const servicePromise = generateJobPostService.generateJobPost(description, type, user);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('LLM request timed out'), { status: 504 })), TIMEOUT_MS)
    );

    const result = await Promise.race([servicePromise, timeoutPromise]);

    // Preserve original shape: return parsed result from service.
    // If you prefer a consistent wrapper, we could return { success: true, data: result } instead.
    return res.json(result);
  } catch (error) {
    // Improve logging without leaking large raw content to clients
    console.error("Error in generateJobPost:", error && error.message ? error.message : error);
    if (error && error.rawResponse) {
      console.error("Raw response length:", String(error.rawResponse).length);
    }

    const status = error?.status || 500;
    const message = status === 504 ? 'LLM provider timeout' : (error?.message || 'Internal error');
    return res.status(status).json({ error: message });
  }
};

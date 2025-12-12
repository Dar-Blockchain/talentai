/**
 * Validate post creation data
 * @param {Object} postData - Raw post data
 * @throws {Error} If validation fails
 * @returns {Object} Validated data
 */
const validatePostData = (postData) => {
  if (!postData || typeof postData !== 'object') {
    const err = new Error('Invalid post data: expected object');
    err.status = 400;
    throw err;
  }

  const { jobDetails, skillAnalysis, linkedinPost } = postData;

  // Validate jobDetails
  if (!jobDetails || typeof jobDetails !== 'object') {
    const err = new Error('jobDetails is required and must be an object');
    err.status = 400;
    throw err;
  }

  if (!jobDetails.title || typeof jobDetails.title !== 'string' || jobDetails.title.trim().length === 0) {
    const err = new Error('Job title is required and must be non-empty');
    err.status = 400;
    throw err;
  }

  if (!jobDetails.description || typeof jobDetails.description !== 'string' || jobDetails.description.trim().length === 0) {
    const err = new Error('Job description is required and must be non-empty');
    err.status = 400;
    throw err;
  }

  // Validate salary if provided
  if (jobDetails.salary) {
    if (typeof jobDetails.salary.min !== 'number' || typeof jobDetails.salary.max !== 'number') {
      const err = new Error('Salary min and max must be numbers');
      err.status = 400;
      throw err;
    }
    if (jobDetails.salary.min > jobDetails.salary.max) {
      const err = new Error('Salary min cannot be greater than max');
      err.status = 400;
      throw err;
    }
  }

  // Validate skillAnalysis
  if (!skillAnalysis || typeof skillAnalysis !== 'object') {
    const err = new Error('skillAnalysis is required and must be an object');
    err.status = 400;
    throw err;
  }

  if (!Array.isArray(skillAnalysis.requiredSkills) || skillAnalysis.requiredSkills.length === 0) {
    const err = new Error('At least one required skill must be specified');
    err.status = 400;
    throw err;
  }

  // Validate linkedinPost
  if (!linkedinPost || typeof linkedinPost !== 'object') {
    const err = new Error('linkedinPost is required and must be an object');
    err.status = 400;
    throw err;
  }

  if (!linkedinPost.formattedContent?.headline || typeof linkedinPost.formattedContent.headline !== 'string') {
    const err = new Error('LinkedIn post headline is required');
    err.status = 400;
    throw err;
  }

  if (!linkedinPost.finalPost || typeof linkedinPost.finalPost !== 'string') {
    const err = new Error('LinkedIn post content is required');
    err.status = 400;
    throw err;
  }

  return true;
};

/**
 * Safely parse skillAnalysis and matchingConfig from form-data
 * @param {Object} data - Request body data
 * @returns {Object} Data with parsed JSON fields
 */
const parseJsonFields = (data) => {
  const result = { ...data };

  // Parse skillAnalysis if it's a string (common from form-data)
  if (typeof result.skillAnalysis === 'string') {
    try {
      result.skillAnalysis = JSON.parse(result.skillAnalysis);
    } catch (err) {
      const parseErr = new Error('Invalid JSON in skillAnalysis field');
      parseErr.status = 400;
      throw parseErr;
    }
  }

  // Parse matchingConfig if it's a string
  if (typeof result.matchingConfig === 'string') {
    try {
      result.matchingConfig = JSON.parse(result.matchingConfig);
    } catch (err) {
      const parseErr = new Error('Invalid JSON in matchingConfig field');
      parseErr.status = 400;
      throw parseErr;
    }
  }

  return result;
};

/**
 * Validate post update data
 * @param {Object} updateData - Data to validate
 * @param {boolean} partial - Allow partial updates
 * @throws {Error} If validation fails
 * @returns {boolean}
 */
const validatePostUpdate = (updateData, partial = true) => {
  if (!updateData || typeof updateData !== 'object') {
    const err = new Error('Invalid update data: expected object');
    err.status = 400;
    throw err;
  }

  // If partial update, allow any valid fields
  if (partial) {
    if (updateData.jobDetails) {
      if (updateData.jobDetails.salary) {
        if (typeof updateData.jobDetails.salary.min !== 'number' || 
            typeof updateData.jobDetails.salary.max !== 'number') {
          const err = new Error('Salary min and max must be numbers');
          err.status = 400;
          throw err;
        }
        if (updateData.jobDetails.salary.min > updateData.jobDetails.salary.max) {
          const err = new Error('Salary min cannot be greater than max');
          err.status = 400;
          throw err;
        }
      }
    }
  }

  return true;
};

/**
 * Validate technical test input
 * @param {string} postId - Post ID
 * @param {string} candidateEmail - Email
 * @param {string} candidateName - Name
 * @throws {Error} If validation fails
 */
const validateTechnicalTestInput = (postId, candidateEmail, candidateName) => {
  if (!postId || typeof postId !== 'string') {
    const err = new Error('postId is required and must be a string');
    err.status = 400;
    throw err;
  }

  if (!candidateEmail || !candidateEmail.includes('@')) {
    const err = new Error('candidateEmail is required and must be valid');
    err.status = 400;
    throw err;
  }

  if (!candidateName || typeof candidateName !== 'string' || candidateName.trim().length === 0) {
    const err = new Error('candidateName is required and must be non-empty');
    err.status = 400;
    throw err;
  }

  return true;
};

module.exports = {
  validatePostData,
  parseJsonFields,
  validatePostUpdate,
  validateTechnicalTestInput
};

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

  const { jobDetails, skillAnalysis } = postData;

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

  return true;
};

const JOB_DETAIL_FIELDS = [
  'title', 'description', 'requirements', 'responsibilities',
  'location', 'workMode', 'employmentType', 'experienceLevel', 'salary',
];

/**
 * Reconstruct nested jobDetails + skillAnalysis from flat request body,
 * or pass through if already nested.
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

  // Reconstruct jobDetails from flat fields if not already nested
  if (!result.jobDetails) {
    const jobDetails = {};
    for (const field of JOB_DETAIL_FIELDS) {
      if (result[field] !== undefined) {
        jobDetails[field] = result[field];
        delete result[field];
      }
    }
    if (Object.keys(jobDetails).length > 0) result.jobDetails = jobDetails;
  }

  // Reconstruct skillAnalysis from flat fields if not already nested
  if (!result.skillAnalysis && (result.requiredSkills || result.softSkills)) {
    result.skillAnalysis = {
      requiredSkills: result.requiredSkills ?? [],
      softSkills: result.softSkills ?? [],
    };
    delete result.requiredSkills;
    delete result.softSkills;
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
 * Flatten a saved post document for API responses.
 * Spreads jobDetails and skillAnalysis to the top level.
 */
const flattenPost = (post) => {
  const obj = post?.toObject ? post.toObject() : { ...post };
  const { jobDetails, skillAnalysis, ...rest } = obj;
  const { _id: _jdId, ...jobDetailsRest } = jobDetails ?? {};
  return {
    ...rest,
    ...jobDetailsRest,
    requiredSkills: skillAnalysis?.requiredSkills ?? [],
    softSkills: skillAnalysis?.softSkills ?? [],
  };
};

module.exports = {
  validatePostData,
  parseJsonFields,
  validatePostUpdate,
  flattenPost,
};

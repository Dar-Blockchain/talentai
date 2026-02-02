/**
 * Pipeline Interview Config Builder
 * Converts pipeline node configuration to HR interview URL parameters
 */

class PipelineInterviewConfigBuilder {
  /**
   * Convert technical node config to interview URL params
   * @param {Object} nodeConfig - Configuration from PostSteps.data.config
   * @param {Object} jobDetails - Job/Post details
   * @returns {Object} URL parameters for interview page
   */
  buildTechnicalParams(nodeConfig, jobDetails) {
    // 🔥 FIXED: Return ALL skills, not just the first one
    const allSkills = nodeConfig.skills && nodeConfig.skills.length > 0
      ? nodeConfig.skills
      : [{ name: 'Technical', requiredLevel: 3 }];

    // For backward compatibility with single-skill interviews, use first skill for base params
    const primarySkill = allSkills[0];

    return {
      type: 'technical',
      skill: primarySkill.name, // Primary skill for URL
      proficiency: this.mapLevelToNumber(nodeConfig.assessmentLevel || 'Mid Level'),
      company: jobDetails.companyName || 'Company',
      role: jobDetails.title || 'Developer',
      difficulty: this.mapLevelToDifficulty(nodeConfig.assessmentLevel || 'Mid Level'),
      duration: '30',
      // ✅ NEW: Include ALL configured data
      categories: nodeConfig.categories || [],
      skills: allSkills, // All skills with their required levels
      assessmentLevel: nodeConfig.assessmentLevel || 'Mid Level',
      passThreshold: nodeConfig.passThreshold || 70,
    };
  }

  /**
   * Convert soft skills node config to interview URL params
   * @param {Object} nodeConfig - Configuration from PostSteps.data.config
   * @param {Object} jobDetails - Job/Post details
   * @returns {Object} URL parameters for interview page
   */
  buildSoftSkillsParams(nodeConfig, jobDetails) {
    // 🔥 FIXED: Return ALL soft skills
    const allSoftSkills = nodeConfig.softSkills && nodeConfig.softSkills.length > 0
      ? nodeConfig.softSkills
      : ['Communication'];

    const primarySkill = allSoftSkills[0];
    const category = this.getCategoryFromSkill(primarySkill);

    return {
      type: 'soft',
      skill: primarySkill, // Primary skill for URL
      category: category,
      proficiency: this.mapLevelToNumber(nodeConfig.assessmentLevel || 'Mid Level'),
      company: jobDetails.companyName || 'Company',
      role: jobDetails.title || 'Position',
      difficulty: this.mapLevelToDifficulty(nodeConfig.assessmentLevel || 'Mid Level'),
      duration: '25',
      // ✅ NEW: Include ALL configured data
      softSkills: allSoftSkills, // All soft skills
      subcategories: nodeConfig.subcategories || [],
      assessmentLevel: nodeConfig.assessmentLevel || 'Mid Level',
      passThreshold: nodeConfig.passThreshold || 70,
    };
  }

  /**
   * Convert HR interview node config to URL params
   * @param {Object} nodeConfig - Configuration from PostSteps.data.config
   * @param {Object} jobDetails - Job/Post details
   * @returns {Object} URL parameters for interview page
   */
  buildHRInterviewParams(nodeConfig, jobDetails) {
    return {
      type: 'hr',
      company: jobDetails.companyName || 'Company',
      role: jobDetails.title || 'Position',
      proficiency: 'Mid-Level',  // Default for HR interviews
      duration: nodeConfig.interviewMode === 'ai' ? '30' : '45',
      // ✅ NEW: Include ALL configured data
      interviewMode: nodeConfig.interviewMode || 'ai',
      interviewType: nodeConfig.interviewType || 'video',
      focusAreas: nodeConfig.focusAreas || [],
    };
  }

  /**
   * Main method to build params based on node type
   * @param {Object} postStep - PostSteps document
   * @param {Object} jobDetails - Job/Post details with companyName and title
   * @returns {Object} URL parameters for interview page
   */
  buildParamsFromNode(postStep, jobDetails) {
    const nodeType = postStep.data.type;
    const nodeConfig = postStep.data.config || {};

    console.log(`📋 Building interview params for node type: ${nodeType}`);
    console.log(`   Node config:`, nodeConfig);

    switch(nodeType) {
      case 'technical':
        return this.buildTechnicalParams(nodeConfig, jobDetails);

      case 'soft':
        return this.buildSoftSkillsParams(nodeConfig, jobDetails);

      case 'interview':
        return this.buildHRInterviewParams(nodeConfig, jobDetails);

      default:
        throw new Error(`Unsupported node type for interview: ${nodeType}`);
    }
  }

  // ===== Helper Methods =====

  /**
   * Map assessment level to proficiency number (1-5)
   */
  mapLevelToNumber(assessmentLevel) {
    const map = {
      'Entry Level': '1',
      'Junior': '2',
      'Mid Level': '3',
      'Senior': '4',
      'Expert': '5'
    };
    return map[assessmentLevel] || '3';
  }

  /**
   * Map assessment level to difficulty string
   */
  mapLevelToDifficulty(assessmentLevel) {
    const map = {
      'Entry Level': 'beginner',
      'Junior': 'beginner',
      'Mid Level': 'intermediate',
      'Senior': 'advanced',
      'Expert': 'expert'
    };
    return map[assessmentLevel] || 'intermediate';
  }

  /**
   * Get category from soft skill name
   */
  getCategoryFromSkill(skillName) {
    // Map soft skills to categories
    const categories = {
      'Communication': 'Interpersonal',
      'Leadership': 'Management',
      'Problem Solving': 'Cognitive',
      'Teamwork': 'Collaboration',
      'Time Management': 'Organization',
      'Adaptability': 'Personal',
      'Critical Thinking': 'Cognitive',
      'Creativity': 'Cognitive'
    };
    return categories[skillName] || 'General';
  }

  /**
   * Build query string from URL params
   * @param {Object} params - URL parameters object
   * @returns {string} Query string (e.g., "type=technical&skill=React&proficiency=4")
   */
  buildQueryString(params) {
    // Remove internal fields that start with _
    const queryParams = Object.entries(params)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return queryParams;
  }
}

module.exports = new PipelineInterviewConfigBuilder();

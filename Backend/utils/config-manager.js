/**
 * Intelligent Interview Configuration Manager
 * Handles rich configuration for adaptive interview experiences
 */

class ConfigManager {
  constructor() {
    this.defaultConfigs = {
      HR_INTERVIEW: {
        models: {
          fastModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          thinkingModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo"
        },
        interviewerPersona: {
          style: "professional",
          tone: "friendly but thorough",
          approach: "behavioral-focused",
          experience: "senior engineering manager",
          background: "10+ years experience",
          expertise: ["team building", "performance management", "technical leadership"]
        },
        intelligenceContext: {
          focusAreas: [
            {
              area: "leadership_potential",
              weight: 0.25,
              indicators: ["mentoring examples", "project ownership", "conflict resolution"],
              depth: "probe for specific examples and outcomes"
            },
            {
              area: "problem_solving",
              weight: 0.3,
              indicators: ["technical challenges", "creative solutions", "systematic thinking"],
              depth: "ask for step-by-step problem breakdown"
            },
            {
              area: "collaboration",
              weight: 0.25,
              indicators: ["cross-team work", "communication style", "feedback handling"],
              depth: "explore difficult collaboration scenarios"
            },
            {
              area: "growth_mindset",
              weight: 0.2,
              indicators: ["learning from failure", "skill development", "feedback incorporation"],
              depth: "understand motivation and learning approach"
            }
          ],
          conversationFlow: {
            opening: "warm, context-setting introduction",
            exploration: "deep-dive into experiences with follow-up questions",
            probing: "situational and behavioral questions",
            validation: "cross-reference answers for consistency",
            closing: "opportunity for candidate questions"
          },
          adaptiveStrategy: {
            introvertedCandidate: "more structured questions, allow thinking time",
            extrovertedCandidate: "open-ended discussions, manage time",
            nervousCandidate: "reassuring tone, easier questions first",
            overconfidentCandidate: "challenging scenarios, probe deeper"
          }
        }
      },
      TECHNICAL_SKILL: {
        models: {
          fastModel: "meta-llama/Llama-3.2-3B-Instruct-Turbo",
          thinkingModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo"
        },
        interviewerPersona: {
          style: "technical",
          tone: "analytical and precise",
          approach: "problem-solving focused",
          experience: "senior technical architect",
          background: "15+ years in software development",
          expertise: ["system design", "code architecture", "performance optimization"]
        },
        intelligenceContext: {
          focusAreas: [
            {
              area: "technical_depth",
              weight: 0.4,
              indicators: ["complex problem solving", "system design thinking", "code quality"],
              depth: "probe for implementation details and trade-offs"
            },
            {
              area: "problem_approach",
              weight: 0.3,
              indicators: ["systematic thinking", "edge case handling", "optimization mindset"],
              depth: "ask for step-by-step problem breakdown"
            },
            {
              area: "learning_ability",
              weight: 0.2,
              indicators: ["new technology adoption", "continuous improvement", "knowledge transfer"],
              depth: "explore how they stay current and learn"
            },
            {
              area: "practical_experience",
              weight: 0.1,
              indicators: ["real-world applications", "debugging skills", "production experience"],
              depth: "understand hands-on experience and challenges"
            }
          ]
        }
      },
      SALARY_INTERVIEW: {
        models: {
          fastModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          thinkingModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
        },
        interviewerPersona: {
          style: "professional",
          tone: "neutral and fair",
          approach: "negotiation-focused",
          experience: "compensation specialist",
          background: "HR compensation expert",
          expertise: ["salary benchmarking", "negotiation", "compensation structure"]
        },
        intelligenceContext: {
          focusAreas: [
            {
              area: "market_awareness",
              weight: 0.3,
              indicators: ["industry knowledge", "role understanding", "market rates"],
              depth: "assess understanding of market value"
            },
            {
              area: "negotiation_skills",
              weight: 0.3,
              indicators: ["communication style", "reasoning ability", "flexibility"],
              depth: "evaluate negotiation approach and reasoning"
            },
            {
              area: "value_proposition",
              weight: 0.25,
              indicators: ["unique skills", "experience value", "contribution potential"],
              depth: "understand what they bring to the role"
            },
            {
              area: "expectations_alignment",
              weight: 0.15,
              indicators: ["realistic expectations", "flexibility", "long-term thinking"],
              depth: "assess alignment with company budget and structure"
            }
          ]
        }
      },
      SOFT_SKILL: {
        models: {
          fastModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          thinkingModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
        },
        interviewerPersona: {
          style: "empathetic",
          tone: "warm and encouraging",
          approach: "scenario-based",
          experience: "organizational psychologist",
          background: "behavioral assessment specialist",
          expertise: ["emotional intelligence", "team dynamics", "communication"]
        },
        intelligenceContext: {
          focusAreas: [
            {
              area: "communication",
              weight: 0.3,
              indicators: ["clarity", "active listening", "adaptability"],
              depth: "assess communication effectiveness in various scenarios"
            },
            {
              area: "emotional_intelligence",
              weight: 0.25,
              indicators: ["self-awareness", "empathy", "emotional regulation"],
              depth: "explore emotional responses and management"
            },
            {
              area: "teamwork",
              weight: 0.25,
              indicators: ["collaboration", "conflict resolution", "support for others"],
              depth: "understand team interaction and contribution"
            },
            {
              area: "adaptability",
              weight: 0.2,
              indicators: ["change management", "learning agility", "resilience"],
              depth: "assess flexibility and response to change"
            }
          ]
        }
      },
      PSYCHOTECHNIC: {
        models: {
          fastModel: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          thinkingModel: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
          analysisModel: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo"
        },
        interviewerPersona: {
          style: "analytical",
          tone: "neutral and objective",
          approach: "assessment-focused",
          experience: "cognitive assessment specialist",
          background: "psychological evaluation expert",
          expertise: ["cognitive assessment", "personality analysis", "behavioral prediction"]
        },
        intelligenceContext: {
          focusAreas: [
            {
              area: "cognitive_abilities",
              weight: 0.4,
              indicators: ["logical reasoning", "pattern recognition", "problem analysis"],
              depth: "assess cognitive processing and reasoning patterns"
            },
            {
              area: "personality_traits",
              weight: 0.3,
              indicators: ["work style", "motivation drivers", "stress response"],
              depth: "understand personality fit for role and environment"
            },
            {
              area: "decision_making",
              weight: 0.2,
              indicators: ["analytical thinking", "risk assessment", "judgment quality"],
              depth: "evaluate decision-making process and quality"
            },
            {
              area: "psychological_resilience",
              weight: 0.1,
              indicators: ["stress tolerance", "pressure handling", "recovery ability"],
              depth: "assess psychological fitness for role demands"
            }
          ]
        }
      }
    };

    this.companyProfiles = {
      Google: {
        culture: ["innovation", "collaboration", "data-driven", "user-focused"],
        values: ["transparency", "excellence", "diversity", "impact"],
        workStyle: "fast-paced",
        decisionMaking: "consensus-based",
        growthOpportunities: ["technical leadership", "mentoring", "cross-team projects"],
        challenges: ["scale", "performance", "user experience", "technical debt"]
      },
      Meta: {
        culture: ["move fast", "be bold", "focus on impact", "build social value"],
        values: ["connection", "community", "innovation", "authenticity"],
        workStyle: "move fast and break things",
        decisionMaking: "data-driven",
        growthOpportunities: ["product ownership", "global impact", "technical innovation"],
        challenges: ["massive scale", "real-time systems", "global compliance"]
      },
      Amazon: {
        culture: ["customer obsession", "ownership", "invent and simplify", "learn and be curious"],
        values: ["customer first", "operational excellence", "frugality", "bias for action"],
        workStyle: "high ownership",
        decisionMaking: "written narratives",
        growthOpportunities: ["leadership principles", "business ownership", "innovation"],
        challenges: ["scale efficiency", "cost optimization", "customer satisfaction"]
      },
      Airbnb: {
        culture: ["belong anywhere", "champion the mission", "be a host", "embrace adventure"],
        values: ["belonging", "trust", "quality", "innovation"],
        workStyle: "collaborative",
        decisionMaking: "design thinking",
        growthOpportunities: ["global perspective", "design excellence", "community building"],
        challenges: ["trust and safety", "global regulations", "community management"]
      },
      EY: {
        culture: ["building trust", "quality excellence", "professional integrity", "client focus"],
        values: ["integrity", "respect", "teaming", "inclusiveness"],
        workStyle: "professional excellence",
        decisionMaking: "consensus and expertise",
        growthOpportunities: ["client leadership", "industry expertise", "global mobility"],
        challenges: ["regulatory compliance", "client expectations", "digital transformation"]
      }
    };
  }

  /**
   * Create intelligent configuration for interview
   */
  createIntelligentConfig(userConfig) {
    const baseConfig = this.defaultConfigs[userConfig.interviewType] || this.defaultConfigs.HR_INTERVIEW;
    const companyProfile = this.companyProfiles[userConfig.context?.targetCompany] || this.companyProfiles.Google;

    return {
      interviewType: userConfig.interviewType,
      testReason: userConfig.testReason,

      context: {
        ...userConfig.context,
        ...this.enrichContext(userConfig.context)
      },

      models: {
        ...baseConfig.models,
        ...userConfig.models // Allow model overrides
      },

      companyProfile: {
        ...companyProfile,
        ...userConfig.companyProfile // Allow company profile overrides
      },

      roleSpecifics: this.generateRoleSpecifics(userConfig.context),

      interviewerPersona: {
        ...baseConfig.interviewerPersona,
        ...userConfig.interviewerPersona
      },

      intelligenceContext: this.buildIntelligenceContext(userConfig, baseConfig),

      sessionSettings: {
        duration: userConfig.sessionSettings?.duration || 45,
        language: userConfig.sessionSettings?.language || "en",
        difficulty: userConfig.sessionSettings?.difficulty || "intermediate",
        silenceTimeout: userConfig.sessionSettings?.silenceTimeout || 5,
        maxSilencePrompts: userConfig.sessionSettings?.maxSilencePrompts || 3,
        recordingEnabled: userConfig.sessionSettings?.recordingEnabled ?? true,
        realTimeAnalysis: userConfig.sessionSettings?.realTimeAnalysis ?? true,
        coverageTracking: userConfig.sessionSettings?.coverageTracking ?? true,
        ...userConfig.sessionSettings
      },

      reportingConfig: {
        realTimeUpdates: true,
        coverageVisualization: true,
        strengthsWeaknesses: true,
        recommendedFollowUp: true,
        scoringCriteria: this.getScoringCriteria(userConfig.interviewType),
        finalReportSections: ["summary", "detailed_analysis", "recommendations", "next_steps"],
        ...userConfig.reportingConfig
      }
    };
  }

  /**
   * Enrich context with intelligent defaults
   */
  enrichContext(context) {
    const enrichments = {};

    if (context?.targetRole) {
      enrichments.department = this.inferDepartment(context.targetRole);
      enrichments.teamSize = this.inferTeamSize(context.targetRole, context.experienceLevel);
      enrichments.reportingLevel = this.inferReportingLevel(context.experienceLevel);
      enrichments.projectTypes = this.inferProjectTypes(context.targetRole);
    }

    if (context?.targetCompany) {
      enrichments.workEnvironment = this.inferWorkEnvironment(context.targetCompany);
    }

    return enrichments;
  }

  /**
   * Generate role-specific information
   */
  generateRoleSpecifics(context) {
    const roleMap = {
      "Software Engineer": {
        keyResponsibilities: [
          "design and implement software features",
          "collaborate with product and design teams",
          "code review and mentoring junior developers",
          "participate in technical architecture decisions"
        ],
        requiredSkills: ["programming", "system design", "collaboration", "problem-solving"],
        desiredQualities: ["technical excellence", "communication", "leadership potential", "adaptability"],
        typicalChallenges: ["tight deadlines", "changing requirements", "performance optimization", "technical debt"]
      },
      "Product Manager": {
        keyResponsibilities: [
          "define product strategy and roadmap",
          "collaborate with engineering and design",
          "analyze user feedback and metrics",
          "coordinate cross-functional teams"
        ],
        requiredSkills: ["product strategy", "data analysis", "stakeholder management", "user empathy"],
        desiredQualities: ["strategic thinking", "communication", "leadership", "analytical mindset"],
        typicalChallenges: ["competing priorities", "resource constraints", "stakeholder alignment", "market changes"]
      },
      "Marketing Manager": {
        keyResponsibilities: [
          "develop marketing strategies",
          "manage campaigns and budgets",
          "analyze market trends and metrics",
          "coordinate with sales and product teams"
        ],
        requiredSkills: ["marketing strategy", "campaign management", "analytics", "creative thinking"],
        desiredQualities: ["creativity", "analytical thinking", "communication", "adaptability"],
        typicalChallenges: ["budget constraints", "market competition", "ROI measurement", "brand consistency"]
      }
    };

    return roleMap[context?.targetRole] || roleMap["Software Engineer"];
  }

  /**
   * Build intelligence context - handles both regular and pipeline interviews
   */
  buildIntelligenceContext(userConfig, baseConfig) {
    // 🔥 Check if this is a pipeline interview with specific skills
    if (userConfig.pipelineConfig) {
      console.log('🎯 Pipeline config detected, building custom intelligence context');
      return this.buildPipelineIntelligenceContext(
        userConfig.pipelineConfig,
        userConfig.interviewType,
        baseConfig.intelligenceContext
      );
    }

    // Regular interview - merge base and user configs
    return {
      ...baseConfig.intelligenceContext,
      ...userConfig.intelligenceContext
    };
  }

  /**
   * Build intelligence context specifically for pipeline interviews
   * Generates focus areas from pipeline step skills
   */
  buildPipelineIntelligenceContext(pipelineConfig, interviewType, baseContext) {
    const focusAreas = [];

    // TECHNICAL SKILL INTERVIEW - Build from technical skills
    if (interviewType === 'TECHNICAL_SKILL' && pipelineConfig.skills && Array.isArray(pipelineConfig.skills)) {
      console.log(`🔧 Building focus areas for ${pipelineConfig.skills.length} technical skills`);

      pipelineConfig.skills.forEach((skill, index) => {
        const skillName = skill.name || skill;
        const requiredLevel = skill.requiredLevel || 3;

        focusAreas.push({
          area: skillName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          weight: 1 / pipelineConfig.skills.length,
          indicators: [
            `${skillName} hands-on implementation experience`,
            `${skillName} best practices and patterns`,
            `Real-world ${skillName} project examples`,
            `${skillName} problem-solving and debugging`,
            `Understanding of ${skillName} ecosystem and tools`
          ],
          depth: `Assess practical ${skillName} proficiency at level ${requiredLevel}/5. Probe for implementation details, trade-offs, and real project experience.`,
          skillLevel: requiredLevel,
          skillName: skillName
        });
      });

      console.log(`✅ Generated ${focusAreas.length} technical skill focus areas`);
    }

    // SOFT SKILL INTERVIEW - Build from soft skills
    else if (interviewType === 'SOFT_SKILL' && pipelineConfig.softSkills && Array.isArray(pipelineConfig.softSkills)) {
      console.log(`🗣️ Building focus areas for ${pipelineConfig.softSkills.length} soft skills`);

      pipelineConfig.softSkills.forEach((softSkill, index) => {
        const skillName = typeof softSkill === 'string' ? softSkill : softSkill.name;

        focusAreas.push({
          area: skillName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          weight: 1 / pipelineConfig.softSkills.length,
          indicators: [
            `${skillName} in workplace scenarios`,
            `Examples demonstrating ${skillName}`,
            `${skillName} development and improvement`,
            `${skillName} application in team settings`,
            `Impact of ${skillName} on work outcomes`
          ],
          depth: `Evaluate ${skillName} through behavioral questions and specific examples. Probe for situations, actions, and results.`,
          skillName: skillName
        });
      });

      console.log(`✅ Generated ${focusAreas.length} soft skill focus areas`);
    }

    // HR INTERVIEW - Use focus areas if provided
    else if (interviewType === 'HR_INTERVIEW' && pipelineConfig.focusAreas && Array.isArray(pipelineConfig.focusAreas)) {
      console.log(`💼 Building focus areas for HR interview with ${pipelineConfig.focusAreas.length} areas`);

      pipelineConfig.focusAreas.forEach((area, index) => {
        const areaName = typeof area === 'string' ? area : area.name;

        focusAreas.push({
          area: areaName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          weight: 1 / pipelineConfig.focusAreas.length,
          indicators: [
            `${areaName} competency`,
            `${areaName} examples`,
            `${areaName} impact`
          ],
          depth: `Assess ${areaName} through behavioral questions`,
          focusArea: areaName
        });
      });

      console.log(`✅ Generated ${focusAreas.length} HR focus areas`);
    }

    // If no focus areas were generated, fall back to base context
    if (focusAreas.length === 0) {
      console.warn('⚠️ No pipeline focus areas generated, using base context');
      return baseContext;
    }

    return {
      focusAreas: focusAreas,
      conversationFlow: baseContext.conversationFlow,
      adaptiveStrategy: baseContext.adaptiveStrategy,
      pipelineMode: true,  // Flag to indicate this is a pipeline interview
      pipelineConfig: pipelineConfig  // Store original pipeline config for reference
    };
  }

  /**
   * Get scoring criteria based on interview type
   */
  getScoringCriteria(interviewType) {
    const criteriaMap = {
      HR_INTERVIEW: ["communication", "problem_solving", "leadership", "cultural_fit"],
      TECHNICAL_SKILL: ["technical_depth", "problem_approach", "code_quality", "system_thinking"],
      SALARY_INTERVIEW: ["market_awareness", "negotiation_skills", "value_proposition", "expectations"],
      SOFT_SKILL: ["communication", "emotional_intelligence", "teamwork", "adaptability"],
      PSYCHOTECHNIC: ["cognitive_abilities", "personality_fit", "decision_making", "resilience"]
    };

    return criteriaMap[interviewType] || criteriaMap.HR_INTERVIEW;
  }

  /**
   * Helper methods for context enrichment
   */
  inferDepartment(role) {
    const deptMap = {
      "Software Engineer": "Engineering",
      "Product Manager": "Product",
      "Marketing Manager": "Marketing",
      "Data Scientist": "Data & Analytics",
      "Designer": "Design"
    };
    return deptMap[role] || "Engineering";
  }

  inferTeamSize(role, experienceLevel) {
    const sizeMap = {
      "Entry-Level": "5-8 people",
      "Mid-Level": "8-12 people",
      "Senior": "10-15 people",
      "Leadership": "15-25 people"
    };
    return sizeMap[experienceLevel] || "8-12 people";
  }

  inferReportingLevel(experienceLevel) {
    const levelMap = {
      "Entry-Level": "Senior Engineer",
      "Mid-Level": "Senior Engineer",
      "Senior": "Engineering Manager",
      "Leadership": "Director of Engineering"
    };
    return levelMap[experienceLevel] || "Senior Engineer";
  }

  inferProjectTypes(role) {
    const projectMap = {
      "Software Engineer": ["web applications", "mobile apps", "APIs", "system optimization"],
      "Product Manager": ["feature launches", "user research", "roadmap planning", "market analysis"],
      "Marketing Manager": ["campaigns", "content strategy", "brand development", "market research"]
    };
    return projectMap[role] || ["software development", "technical projects"];
  }

  inferWorkEnvironment(company) {
    const envMap = {
      "Google": "hybrid",
      "Meta": "hybrid",
      "Amazon": "flexible",
      "Airbnb": "remote-friendly",
      "EY": "office-based"
    };
    return envMap[company] || "hybrid";
  }

  /**
   * Validate configuration completeness
   */
  validateConfig(config) {
    const required = ['interviewType', 'testReason', 'context', 'models'];
    const missing = required.filter(field => !config[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required configuration fields: ${missing.join(', ')}`);
    }

    if (!config.context.targetRole || !config.context.targetCompany) {
      throw new Error('Target role and company are required in context');
    }

    return true;
  }
}

module.exports = new ConfigManager();
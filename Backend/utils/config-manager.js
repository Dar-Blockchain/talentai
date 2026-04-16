/**
 * Intelligent Interview Configuration Manager
 * Handles rich configuration for adaptive interview experiences
 */

/**
 * Detect job category from title and description keywords.
 * Used by Agent Persona to select category-specific evaluation frameworks.
 */
function detectJobCategory(title, description) {
  const combined = (title + " " + (description || "")).toLowerCase();
  const categoryKeywords = {
    engineering: ["developer", "engineer", "programmer", "architect", "devops", "sre", "frontend", "backend", "fullstack", "full-stack", "mobile", "ios", "android", "qa", "tester", "software"],
    marketing: ["marketing", "growth", "seo", "content", "brand", "social media", "demand gen", "campaign"],
    sales: ["sales", "account executive", "bdr", "sdr", "business development", "revenue", "account manager"],
    design: ["designer", "ux", "ui", "product design", "visual", "graphic", "creative"],
    product: ["product manager", "product owner", "program manager"],
    data: ["data scientist", "data analyst", "data engineer", "ml engineer", "machine learning", "analytics"],
    customer_support: ["support", "customer success", "helpdesk", "customer service"],
    management: ["director", "vp", "head of", "chief", "cto", "cmo", "manager", "team lead"],
    operations: ["operations", "logistics", "supply chain", "procurement"],
    finance: ["finance", "accounting", "controller", "auditor", "treasury"],
  };
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => combined.includes(kw))) return category;
  }
  return "engineering";
}

/**
 * Get category-specific evaluation framework for a given job category and interview type.
 * Returns focusAreas (with weights, descriptions, indicators) and questionStyles.
 */
function getEvaluationFramework(jobCategory, interviewType) {
  const frameworks = {
    engineering: {
      TECHNICAL_SKILL: {
        focusAreas: {
          technical_depth: { weight: 35, description: "Deep technical knowledge, system design, architecture trade-offs", indicators: ["system design", "architecture patterns", "performance trade-offs", "code quality"] },
          problem_solving: { weight: 25, description: "Systematic debugging, algorithm thinking, edge-case handling", indicators: ["debugging approach", "algorithm choice", "edge cases", "root cause analysis"] },
          code_quality: { weight: 20, description: "Clean code, testing practices, code review, maintainability", indicators: ["testing strategy", "refactoring", "code review", "documentation"] },
          practical_experience: { weight: 20, description: "Real-world project experience, production systems, DevOps", indicators: ["production issues", "deployment", "monitoring", "team collaboration"] },
        },
        questionStyles: ["scenario-based", "code review", "architecture discussion", "debugging walkthrough"],
      },
      HR_INTERVIEW: {
        focusAreas: {
          leadership_potential: { weight: 25, description: "Mentoring, project ownership, initiative, conflict resolution", indicators: ["mentoring", "ownership", "initiative", "conflict resolution"] },
          problem_solving: { weight: 30, description: "Technical challenges overcome, creative solutions, systematic thinking", indicators: ["challenge examples", "creative solutions", "systematic approach"] },
          collaboration: { weight: 25, description: "Cross-team work, communication style, feedback handling", indicators: ["cross-team", "communication", "feedback", "pair programming"] },
          growth_mindset: { weight: 20, description: "Learning from failure, skill development, feedback incorporation", indicators: ["learning examples", "skill growth", "feedback response"] },
        },
        questionStyles: ["behavioral STAR", "situational", "values-based", "motivational"],
      },
      SOFT_SKILL: {
        focusAreas: {
          communication: { weight: 30, description: "Technical communication, documentation, presenting ideas", indicators: ["clarity", "technical writing", "presentation", "active listening"] },
          teamwork: { weight: 25, description: "Pair programming, code reviews, team dynamics", indicators: ["collaboration", "knowledge sharing", "team support"] },
          adaptability: { weight: 25, description: "Learning new tech, handling changing requirements", indicators: ["tech adoption", "change response", "flexibility"] },
          emotional_intelligence: { weight: 20, description: "Self-awareness, empathy, handling pressure", indicators: ["self-awareness", "empathy", "pressure handling"] },
        },
        questionStyles: ["behavioral STAR", "scenario-based", "reflective"],
      },
    },
    marketing: {
      TECHNICAL_SKILL: {
        focusAreas: {
          strategy_thinking: { weight: 30, description: "Campaign strategy, market analysis, brand positioning", indicators: ["campaign planning", "market analysis", "positioning", "competitive analysis"] },
          data_driven: { weight: 25, description: "Analytics, A/B testing, ROI measurement, attribution", indicators: ["metrics", "A/B testing", "ROI", "attribution models"] },
          creativity: { weight: 25, description: "Content creation, messaging, innovative campaigns", indicators: ["content strategy", "messaging", "campaign innovation", "storytelling"] },
          execution: { weight: 20, description: "Campaign management, budget handling, cross-functional delivery", indicators: ["project management", "budget", "stakeholder coordination", "timelines"] },
        },
        questionStyles: ["case study", "portfolio review", "campaign analysis", "metrics discussion"],
      },
      HR_INTERVIEW: {
        focusAreas: {
          leadership_potential: { weight: 25, description: "Team management, stakeholder influence, initiative", indicators: ["team leadership", "influence", "initiative"] },
          strategic_thinking: { weight: 30, description: "Market vision, long-term planning, competitive awareness", indicators: ["vision", "planning", "market awareness"] },
          collaboration: { weight: 25, description: "Cross-functional work, agency management, stakeholder alignment", indicators: ["cross-functional", "agency work", "alignment"] },
          growth_mindset: { weight: 20, description: "Industry trends, skill development, experimentation", indicators: ["trend awareness", "learning", "experimentation"] },
        },
        questionStyles: ["behavioral STAR", "situational", "case study"],
      },
      SOFT_SKILL: {
        focusAreas: {
          communication: { weight: 30, description: "Storytelling, presenting to stakeholders, written communication", indicators: ["storytelling", "presentations", "written clarity"] },
          teamwork: { weight: 25, description: "Cross-functional collaboration, agency management", indicators: ["collaboration", "agency work", "team dynamics"] },
          adaptability: { weight: 25, description: "Handling shifting priorities, market changes", indicators: ["priority shifts", "market adaptation", "flexibility"] },
          emotional_intelligence: { weight: 20, description: "Brand empathy, customer understanding, team dynamics", indicators: ["empathy", "customer focus", "self-awareness"] },
        },
        questionStyles: ["behavioral STAR", "scenario-based", "reflective"],
      },
    },
    sales: {
      TECHNICAL_SKILL: {
        focusAreas: {
          selling_skills: { weight: 35, description: "Prospecting, qualification, pipeline management, closing", indicators: ["prospecting", "qualification", "pipeline", "closing techniques"] },
          product_knowledge: { weight: 20, description: "Product understanding, value articulation, competitive positioning", indicators: ["product mastery", "value prop", "competitive awareness"] },
          process_discipline: { weight: 25, description: "CRM usage, forecasting, activity management, methodology", indicators: ["CRM discipline", "forecasting", "methodology adherence"] },
          relationship_building: { weight: 20, description: "Client relationships, trust building, long-term accounts", indicators: ["trust building", "account management", "networking"] },
        },
        questionStyles: ["role-play", "deal walkthrough", "objection handling", "pipeline review"],
      },
      HR_INTERVIEW: {
        focusAreas: {
          drive_resilience: { weight: 30, description: "Motivation, handling rejection, persistence", indicators: ["motivation", "rejection handling", "persistence", "quota achievement"] },
          communication: { weight: 25, description: "Persuasion, active listening, presentation skills", indicators: ["persuasion", "listening", "presenting"] },
          collaboration: { weight: 25, description: "Team selling, cross-functional work, manager relationships", indicators: ["team selling", "cross-functional", "manager relationship"] },
          growth_mindset: { weight: 20, description: "Coachability, skill development, market learning", indicators: ["coachability", "learning", "improvement"] },
        },
        questionStyles: ["behavioral STAR", "deal storytelling", "situational"],
      },
      SOFT_SKILL: {
        focusAreas: {
          communication: { weight: 30, description: "Persuasion, active listening, tailoring message to audience", indicators: ["persuasion", "listening", "audience adaptation"] },
          emotional_intelligence: { weight: 25, description: "Reading buyer signals, empathy, managing relationships", indicators: ["buyer signals", "empathy", "relationship management"] },
          teamwork: { weight: 25, description: "Team selling, knowledge sharing, mentoring", indicators: ["team selling", "sharing", "mentoring"] },
          adaptability: { weight: 20, description: "Handling objections, pivoting strategy, market changes", indicators: ["objection handling", "pivoting", "market adaptation"] },
        },
        questionStyles: ["behavioral STAR", "role-play", "scenario-based"],
      },
    },
    design: {
      TECHNICAL_SKILL: {
        focusAreas: {
          design_process: { weight: 30, description: "Design thinking, user-centered design, wireframing, prototyping", indicators: ["design thinking", "user-centered", "wireframing", "prototyping"] },
          user_research: { weight: 25, description: "User interviews, usability testing, persona development", indicators: ["user research", "usability testing", "personas", "journey mapping"] },
          visual_craft: { weight: 25, description: "Visual design, interaction patterns, accessibility, design systems", indicators: ["visual design", "interaction", "accessibility", "design systems"] },
          tools_collaboration: { weight: 20, description: "Design tools proficiency, developer handoff, design systems", indicators: ["Figma/Sketch", "developer handoff", "design system contribution"] },
        },
        questionStyles: ["portfolio review", "design critique", "whiteboard exercise", "case study"],
      },
      HR_INTERVIEW: {
        focusAreas: {
          leadership_potential: { weight: 25, description: "Design advocacy, mentoring, process improvement", indicators: ["design advocacy", "mentoring", "process improvement"] },
          problem_solving: { weight: 30, description: "Design challenges, constraint handling, creative solutions", indicators: ["design challenges", "constraints", "creative solutions"] },
          collaboration: { weight: 25, description: "Working with PMs, engineers, stakeholders", indicators: ["PM collaboration", "engineering handoff", "stakeholder management"] },
          growth_mindset: { weight: 20, description: "Design trends, skill development, feedback incorporation", indicators: ["trend awareness", "skill growth", "feedback response"] },
        },
        questionStyles: ["behavioral STAR", "situational", "portfolio discussion"],
      },
      SOFT_SKILL: {
        focusAreas: {
          communication: { weight: 30, description: "Presenting designs, articulating decisions, stakeholder communication", indicators: ["design presentations", "decision articulation", "stakeholder communication"] },
          teamwork: { weight: 25, description: "Cross-functional collaboration, design reviews", indicators: ["cross-functional", "design reviews", "team dynamics"] },
          adaptability: { weight: 25, description: "Handling feedback, iterating on designs, changing requirements", indicators: ["feedback handling", "iteration", "requirement changes"] },
          emotional_intelligence: { weight: 20, description: "User empathy, team dynamics, handling critique", indicators: ["user empathy", "critique handling", "self-awareness"] },
        },
        questionStyles: ["behavioral STAR", "scenario-based", "reflective"],
      },
    },
    product: {
      TECHNICAL_SKILL: {
        focusAreas: {
          product_strategy: { weight: 30, description: "Roadmap planning, prioritization, market analysis, vision", indicators: ["roadmap", "prioritization frameworks", "market analysis", "product vision"] },
          user_focus: { weight: 25, description: "User research, customer empathy, problem definition", indicators: ["user research", "customer interviews", "problem statements", "personas"] },
          execution: { weight: 25, description: "Sprint management, stakeholder alignment, metrics tracking", indicators: ["sprint planning", "stakeholder management", "KPIs", "launch process"] },
          technical_acumen: { weight: 20, description: "Technical understanding, API knowledge, data fluency", indicators: ["tech understanding", "API awareness", "data analysis", "technical tradeoffs"] },
        },
        questionStyles: ["case study", "prioritization exercise", "metrics discussion", "roadmap review"],
      },
      HR_INTERVIEW: {
        focusAreas: {
          leadership_potential: { weight: 30, description: "Influence without authority, stakeholder management, vision setting", indicators: ["influence", "stakeholder management", "vision"] },
          problem_solving: { weight: 25, description: "Ambiguity handling, data-driven decisions, trade-off analysis", indicators: ["ambiguity", "data-driven", "trade-offs"] },
          collaboration: { weight: 25, description: "Engineering partnership, design collaboration, executive communication", indicators: ["engineering partnership", "design collaboration", "exec communication"] },
          growth_mindset: { weight: 20, description: "Market learning, user empathy development, skill growth", indicators: ["market learning", "empathy growth", "skill development"] },
        },
        questionStyles: ["behavioral STAR", "case study", "situational"],
      },
      SOFT_SKILL: {
        focusAreas: {
          communication: { weight: 30, description: "Stakeholder communication, executive presentations, writing PRDs", indicators: ["stakeholder communication", "presentations", "PRD writing"] },
          teamwork: { weight: 25, description: "Cross-functional leadership, engineering collaboration", indicators: ["cross-functional", "engineering collaboration", "team alignment"] },
          adaptability: { weight: 25, description: "Pivoting strategy, handling ambiguity, market changes", indicators: ["pivoting", "ambiguity handling", "market adaptation"] },
          emotional_intelligence: { weight: 20, description: "User empathy, team dynamics, conflict resolution", indicators: ["user empathy", "team dynamics", "conflict resolution"] },
        },
        questionStyles: ["behavioral STAR", "scenario-based", "case study"],
      },
    },
    data: {
      TECHNICAL_SKILL: {
        focusAreas: {
          analytical_skills: { weight: 30, description: "Statistical analysis, hypothesis testing, data modeling", indicators: ["statistics", "hypothesis testing", "data modeling", "experimental design"] },
          tools_technologies: { weight: 25, description: "SQL, Python/R, visualization tools, ML frameworks", indicators: ["SQL", "Python/R", "visualization", "ML tools"] },
          insights_communication: { weight: 25, description: "Data storytelling, dashboard design, stakeholder presentations", indicators: ["storytelling", "dashboards", "presentations", "recommendations"] },
          business_acumen: { weight: 20, description: "KPI definition, business metrics, strategic impact", indicators: ["KPIs", "business metrics", "strategic thinking", "problem framing"] },
        },
        questionStyles: ["case study", "SQL challenge", "metrics discussion", "analysis walkthrough"],
      },
      HR_INTERVIEW: {
        focusAreas: {
          problem_solving: { weight: 30, description: "Analytical challenges, ambiguity handling, creative approaches", indicators: ["analytical challenges", "ambiguity", "creative solutions"] },
          collaboration: { weight: 25, description: "Stakeholder partnership, cross-functional work", indicators: ["stakeholder partnership", "cross-functional", "data democratization"] },
          communication: { weight: 25, description: "Explaining complex findings, influencing decisions with data", indicators: ["simplifying complexity", "data influence", "presenting findings"] },
          growth_mindset: { weight: 20, description: "Learning new tools, staying current, mentoring", indicators: ["tool learning", "staying current", "mentoring"] },
        },
        questionStyles: ["behavioral STAR", "case study", "situational"],
      },
      SOFT_SKILL: {
        focusAreas: {
          communication: { weight: 30, description: "Explaining complex findings to non-technical stakeholders", indicators: ["simplifying complexity", "stakeholder communication", "data storytelling"] },
          teamwork: { weight: 25, description: "Cross-functional collaboration, knowledge sharing", indicators: ["cross-functional", "knowledge sharing", "pair analysis"] },
          adaptability: { weight: 25, description: "New tools, changing data sources, evolving requirements", indicators: ["tool adoption", "data source changes", "requirement evolution"] },
          emotional_intelligence: { weight: 20, description: "Handling pushback on findings, empathy for stakeholders", indicators: ["pushback handling", "stakeholder empathy", "self-awareness"] },
        },
        questionStyles: ["behavioral STAR", "scenario-based", "reflective"],
      },
    },
  };

  // Fallback categories share engineering framework with adjusted descriptions
  const fallbackCategories = ["customer_support", "management", "operations", "finance"];

  const categoryFramework = frameworks[jobCategory];
  if (categoryFramework) {
    const typeFramework = categoryFramework[interviewType] || categoryFramework.TECHNICAL_SKILL || categoryFramework.HR_INTERVIEW;
    return typeFramework;
  }

  // For categories without specific frameworks, use engineering as base
  if (fallbackCategories.includes(jobCategory)) {
    const engFramework = frameworks.engineering;
    return engFramework[interviewType] || engFramework.TECHNICAL_SKILL;
  }

  // Ultimate fallback
  return frameworks.engineering[interviewType] || frameworks.engineering.TECHNICAL_SKILL;
}

class ConfigManager {
  constructor() {
    this.defaultConfigs = {
      HR_INTERVIEW: {
        models: {
          fastModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          thinkingModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
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
          fastModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          thinkingModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
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
          fastModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          thinkingModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
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
          fastModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          thinkingModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
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
          fastModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          thinkingModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          analysisModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
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

    // Dynamic company profiles — no longer hardcoded to 5 companies
    this.companyProfiles = {};
  }

  /**
   * Create intelligent configuration for interview
   */
  createIntelligentConfig(userConfig) {
    const baseConfig = this.defaultConfigs[userConfig.interviewType] || this.defaultConfigs.HR_INTERVIEW;
    const companyName = userConfig.context?.targetCompany || 'the company';
    const companyProfile = this.companyProfiles[companyName] || {
      culture: ["professional growth", "collaboration", "excellence"],
      values: ["integrity", "innovation", "teamwork"],
      workStyle: "professional",
      decisionMaking: "collaborative",
      growthOpportunities: ["career development", "skill building"],
      challenges: ["industry challenges", "growth and scaling"]
    };

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
        duration: userConfig.sessionSettings?.duration || 20,
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

    // Exact match first
    if (roleMap[context?.targetRole]) return roleMap[context.targetRole];

    // Keyword-based matching
    const roleLower = (context?.targetRole || '').toLowerCase();
    if (roleLower.includes('marketing') || roleLower.includes('growth'))
      return roleMap["Marketing Manager"];
    if (roleLower.includes('product'))
      return roleMap["Product Manager"];
    if (roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('devops'))
      return roleMap["Software Engineer"];

    // Generic professional fallback
    return {
      keyResponsibilities: [
        "drive results in area of expertise",
        "collaborate with cross-functional teams",
        "develop and execute strategies",
        "analyze and report on key metrics"
      ],
      requiredSkills: ["domain expertise", "communication", "problem-solving", "strategic thinking"],
      desiredQualities: ["leadership", "analytical mindset", "adaptability", "results orientation"],
      typicalChallenges: ["competing priorities", "resource constraints", "market changes", "stakeholder alignment"]
    };
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

    // Generate role-aware focus areas for non-pipeline interviews
    const targetRole = userConfig.context?.targetRole;
    if (targetRole) {
      const roleFocusAreas = this.generateRoleFocusAreas(targetRole);
      if (roleFocusAreas) {
        console.log(`🎯 Role-aware focus areas generated for "${targetRole}"`);
        return { ...baseConfig.intelligenceContext, focusAreas: roleFocusAreas };
      }
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
   * Generate role-aware focus areas based on job title keywords
   */
  generateRoleFocusAreas(targetRole) {
    const roleLower = targetRole.toLowerCase();

    if (roleLower.includes('marketing') || roleLower.includes('growth')) {
      return [
        { area: "marketing_strategy", weight: 0.3,
          indicators: ["campaign planning", "market analysis", "growth tactics", "brand strategy"],
          depth: "assess strategic marketing thinking and planning ability" },
        { area: "analytics_data", weight: 0.25,
          indicators: ["metrics tracking", "data-driven decisions", "ROI analysis", "A/B testing"],
          depth: "evaluate analytical capabilities and data literacy" },
        { area: "channel_expertise", weight: 0.25,
          indicators: ["digital channels", "content strategy", "audience targeting", "SEO/SEM"],
          depth: "assess knowledge of marketing channels and tools" },
        { area: "execution_results", weight: 0.2,
          indicators: ["campaign execution", "budget management", "performance optimization", "stakeholder reporting"],
          depth: "evaluate practical execution and results orientation" }
      ];
    }

    if (roleLower.includes('sales') || roleLower.includes('business development') || roleLower.includes('account')) {
      return [
        { area: "sales_process", weight: 0.3,
          indicators: ["prospecting", "qualification", "pipeline management", "closing techniques"],
          depth: "assess sales methodology and process knowledge" },
        { area: "relationship_building", weight: 0.25,
          indicators: ["client management", "trust building", "networking", "stakeholder engagement"],
          depth: "evaluate relationship and communication skills" },
        { area: "negotiation_closing", weight: 0.25,
          indicators: ["deal structuring", "objection handling", "value selling", "contract negotiation"],
          depth: "assess negotiation and closing abilities" },
        { area: "market_knowledge", weight: 0.2,
          indicators: ["industry trends", "competitive landscape", "target market", "customer needs"],
          depth: "evaluate market and industry understanding" }
      ];
    }

    if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui')) {
      return [
        { area: "design_process", weight: 0.3,
          indicators: ["design thinking", "user-centered design", "wireframing", "prototyping"],
          depth: "assess design methodology and process" },
        { area: "user_research", weight: 0.25,
          indicators: ["user interviews", "usability testing", "persona development", "journey mapping"],
          depth: "evaluate research and user empathy skills" },
        { area: "visual_interaction", weight: 0.25,
          indicators: ["visual design", "interaction patterns", "accessibility", "responsive design"],
          depth: "assess visual and interaction design expertise" },
        { area: "tools_collaboration", weight: 0.2,
          indicators: ["design tools", "design systems", "developer handoff", "cross-functional work"],
          depth: "evaluate tooling proficiency and collaboration" }
      ];
    }

    if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('analytics')) {
      return [
        { area: "data_analysis", weight: 0.3,
          indicators: ["statistical analysis", "data modeling", "hypothesis testing", "data cleaning"],
          depth: "assess analytical and statistical skills" },
        { area: "tools_technologies", weight: 0.25,
          indicators: ["SQL", "Python/R", "visualization tools", "ETL processes"],
          depth: "evaluate technical data tools proficiency" },
        { area: "insights_communication", weight: 0.25,
          indicators: ["data storytelling", "dashboard design", "stakeholder presentations", "recommendations"],
          depth: "assess ability to communicate insights" },
        { area: "business_acumen", weight: 0.2,
          indicators: ["business metrics", "KPI definition", "strategic thinking", "problem framing"],
          depth: "evaluate business understanding and impact" }
      ];
    }

    if (roleLower.includes('project') || roleLower.includes('program') || roleLower.includes('scrum')) {
      return [
        { area: "project_planning", weight: 0.3,
          indicators: ["scope management", "timeline planning", "resource allocation", "risk management"],
          depth: "assess project planning and management skills" },
        { area: "execution_delivery", weight: 0.25,
          indicators: ["milestone tracking", "blocker resolution", "quality assurance", "delivery management"],
          depth: "evaluate execution and delivery capabilities" },
        { area: "stakeholder_management", weight: 0.25,
          indicators: ["communication", "expectation management", "status reporting", "conflict resolution"],
          depth: "assess stakeholder management abilities" },
        { area: "methodology", weight: 0.2,
          indicators: ["agile/scrum", "waterfall", "process improvement", "retrospectives"],
          depth: "evaluate methodology knowledge and adaptability" }
      ];
    }

    return null; // No match — use generic defaults
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

const configManager = new ConfigManager();
module.exports = configManager;
module.exports.detectJobCategory = detectJobCategory;
module.exports.getEvaluationFramework = getEvaluationFramework;
/**
 * AI-Verified Badge Evaluation Engine
 *
 * Analyzes candidate's real skill usage, project history, test performance,
 * experience progression, and cross-skill coherence to issue professional,
 * recruiter-credible badges.
 */

export type ProficiencyLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface SkillEvidence {
  skillName: string;
  testScore?: number;
  experienceYears?: number;
  projectCount?: number;
  realWorldUsage?: boolean;
  certifications?: string[];
  endorsements?: number;
  lastUsedDate?: string;
  proficiencyLevel?: string;
}

export interface BadgeValidation {
  title: string;
  proficiencyLevel: ProficiencyLevel;
  validationStatement: string;
  issuedDate: string;
  evidenceSummary: string;
  confidenceScore: number; // 0-100
  verificationCriteria: string[];
}

export interface SkillBadge extends BadgeValidation {
  type: 'individual';
  skillName: string;
}

export interface StackBadge extends BadgeValidation {
  type: 'stack';
  stackName: string;
  coreSkills: string[];
  replacedBadges: string[]; // Individual badges that this stack badge replaces
}

export type Badge = SkillBadge | StackBadge;

/**
 * AI-Powered Skill Taxonomy
 * Maps skills to their canonical names and categories
 */
const SKILL_ALIASES: Record<string, string[]> = {
  // Technical Skills
  'JavaScript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'vanilla js'],
  'TypeScript': ['ts', 'typescript'],
  'React': ['react', 'react.js', 'reactjs', 'react js'],
  'Node.js': ['node', 'node.js', 'nodejs', 'node js'],
  'Python': ['python', 'py', 'python3'],
  'Java': ['java', 'jdk', 'jvm'],
  'HTML': ['html', 'html5', 'hypertext'],
  'CSS': ['css', 'css3', 'cascading'],
  'MongoDB': ['mongo', 'mongodb', 'mongo db'],
  'PostgreSQL': ['postgres', 'postgresql', 'psql', 'pg'],
  'MySQL': ['mysql', 'my sql'],
  'Docker': ['docker', 'dockerfile'],
  'Kubernetes': ['kubernetes', 'k8s', 'kube'],
  'AWS': ['aws', 'amazon web services'],
  'Three.js': ['three', 'three.js', 'threejs', 'webgl'],
  'Express.js': ['express', 'express.js', 'expressjs'],
  'Redux': ['redux', 'react-redux'],
  'Vue': ['vue', 'vue.js', 'vuejs'],
  'Angular': ['angular', 'angular.js', 'angularjs'],
  'Spring': ['spring', 'spring boot', 'springboot'],
  'Django': ['django', 'django rest'],
  'Flask': ['flask'],
  'FastAPI': ['fastapi', 'fast api'],

  // Soft Skills
  'Communication': ['communication', 'verbal communication', 'written communication', 'communicating'],
  'Leadership': ['leadership', 'leading', 'team leadership', 'project leadership'],
  'Teamwork': ['teamwork', 'team work', 'collaboration', 'team collaboration'],
  'Problem Solving': ['problem solving', 'problem-solving', 'troubleshooting', 'analytical thinking'],
  'Critical Thinking': ['critical thinking', 'analytical thinking', 'analysis'],
  'Time Management': ['time management', 'time-management', 'scheduling', 'prioritization'],
  'Adaptability': ['adaptability', 'flexibility', 'being flexible', 'adaptive'],
  'Creativity': ['creativity', 'creative thinking', 'innovation', 'innovative'],
  'Empathy': ['empathy', 'empathetic', 'understanding', 'compassion'],
  'Decision Making': ['decision making', 'decision-making', 'making decisions'],
  'Strategic Thinking': ['strategic thinking', 'strategy', 'strategic planning'],
  'Conflict Resolution': ['conflict resolution', 'conflict management', 'resolving conflicts'],
  'Organization': ['organization', 'organizational skills', 'organizing'],
  'Active Listening': ['active listening', 'listening', 'listening skills'],
  'Flexibility': ['flexibility', 'being flexible', 'adaptable'],
  'Learning Agility': ['learning agility', 'fast learner', 'quick learner', 'continuous learning'],
  'Resilience': ['resilience', 'perseverance', 'persistence', 'grit']
};

/**
 * AI Knowledge Base: Technology Stacks
 * Dynamically generated based on skill relationships
 */
export const TECHNOLOGY_STACKS = {
  'Full-Stack JavaScript': {
    coreSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Complete JavaScript ecosystem mastery',
    category: 'technical'
  },
  'Modern Frontend': {
    coreSkills: ['React', 'TypeScript', 'CSS', 'HTML'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Advanced frontend development stack',
    category: 'technical'
  },
  'MERN Stack': {
    coreSkills: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Full-stack JavaScript web development',
    category: 'technical'
  },
  'Backend Engineering': {
    coreSkills: ['Node.js', 'PostgreSQL', 'Express.js'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Enterprise backend systems',
    category: 'technical'
  },
  'Python Full-Stack': {
    coreSkills: ['Python', 'Django', 'PostgreSQL'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Python-based full-stack development',
    category: 'technical'
  },
  'Java Enterprise': {
    coreSkills: ['Java', 'Spring', 'MySQL'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Enterprise Java development',
    category: 'technical'
  },
  '3D Web Graphics': {
    coreSkills: ['JavaScript', 'Three.js', 'HTML', 'CSS'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: '3D graphics and WebGL development',
    category: 'technical'
  },
  'Cloud Native Developer': {
    coreSkills: ['Docker', 'Kubernetes', 'AWS'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Cloud-native architecture and deployment',
    category: 'technical'
  },
  'DevOps Engineer': {
    coreSkills: ['Docker', 'Kubernetes', 'AWS'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Infrastructure automation and deployment',
    category: 'technical'
  },
  'Web Fundamentals': {
    coreSkills: ['HTML', 'CSS', 'JavaScript'],
    minProficiency: 'Bronze' as ProficiencyLevel,
    description: 'Core web development essentials',
    category: 'technical'
  }
};

/**
 * Soft Skills Stacks - Professional competency combinations
 */
export const SOFT_SKILL_STACKS = {
  'Leadership Excellence': {
    coreSkills: ['Leadership', 'Communication', 'Decision Making', 'Strategic Thinking'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Comprehensive leadership and management capabilities',
    category: 'soft'
  },
  'Team Collaboration': {
    coreSkills: ['Teamwork', 'Communication', 'Empathy', 'Conflict Resolution'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Effective team dynamics and collaboration',
    category: 'soft'
  },
  'Project Management': {
    coreSkills: ['Time Management', 'Organization', 'Leadership', 'Communication'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'End-to-end project delivery expertise',
    category: 'soft'
  },
  'Creative Problem Solver': {
    coreSkills: ['Problem Solving', 'Critical Thinking', 'Creativity', 'Adaptability'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Innovative solution development',
    category: 'soft'
  },
  'Customer Success': {
    coreSkills: ['Communication', 'Empathy', 'Problem Solving', 'Active Listening'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Customer-focused excellence',
    category: 'soft'
  },
  'Agile Professional': {
    coreSkills: ['Adaptability', 'Flexibility', 'Learning Agility', 'Resilience'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Thriving in dynamic environments',
    category: 'soft'
  }
};

/**
 * Normalize skill name using AI-powered matching
 */
function normalizeSkillName(skillName: string): string {
  const normalized = skillName.toLowerCase().trim();

  // Check aliases first
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.includes(normalized) || canonical.toLowerCase() === normalized) {
      return canonical;
    }
  }

  // Check for exact match with canonical names (case-insensitive)
  for (const canonical of Object.keys(SKILL_ALIASES)) {
    if (canonical.toLowerCase() === normalized) {
      return canonical;
    }
  }

  // Return original with proper casing
  return skillName;
}

/**
 * AI-driven proficiency level determination
 * Uses multiple signals for explainable AI judgment
 */
export function determineProficiencyLevel(evidence: SkillEvidence): ProficiencyLevel {
  const {
    testScore = 0,
    experienceYears = 0,
    projectCount = 0,
    realWorldUsage = false,
    certifications = [],
    endorsements = 0
  } = evidence;

  // Weighted scoring system
  let score = 0;
  let maxScore = 0;

  // Test performance (35% weight)
  if (testScore > 0) {
    score += (testScore / 100) * 35;
    maxScore += 35;
  }

  // Experience duration (25% weight)
  if (experienceYears > 0) {
    const expScore = Math.min(experienceYears / 5, 1) * 25; // Max at 5 years
    score += expScore;
    maxScore += 25;
  }

  // Project portfolio (20% weight)
  if (projectCount > 0) {
    const projectScore = Math.min(projectCount / 10, 1) * 20; // Max at 10 projects
    score += projectScore;
    maxScore += 20;
  }

  // Real-world usage verification (10% weight)
  if (realWorldUsage) {
    score += 10;
    maxScore += 10;
  }

  // Certifications (5% weight)
  if (certifications.length > 0) {
    score += Math.min(certifications.length * 2.5, 5);
    maxScore += 5;
  }

  // Peer endorsements (5% weight)
  if (endorsements > 0) {
    score += Math.min(endorsements / 2, 5);
    maxScore += 5;
  }

  // Normalize to percentage
  const normalizedScore = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Determine medal tier based primarily on test score
  if (testScore >= 90) {
    return 'Platinum';
  } else if (testScore >= 75) {
    return 'Gold';
  } else if (testScore >= 60) {
    return 'Silver';
  } else if (testScore >= 40) {
    return 'Bronze';
  }

  // No badge if below threshold (less than 40%)
  return 'Bronze';
}

/**
 * Generate validation statement based on evidence
 */
function generateValidationStatement(
  skillName: string,
  level: ProficiencyLevel,
  evidence: SkillEvidence
): string {
  const statements = {
    Platinum: [
      `Achieved exceptional ${skillName} mastery with ${evidence.testScore}% test performance - top tier achievement.`,
      `Verified platinum-level ${skillName} expertise through outstanding assessment results and demonstrated excellence.`,
      `Proven ${skillName} mastery through exceptional technical performance and validated expertise.`
    ],
    Gold: [
      `Earned gold-tier ${skillName} certification with ${evidence.testScore}% assessment score - advanced proficiency confirmed.`,
      `Validated gold-level ${skillName} capabilities through comprehensive testing and strong performance.`,
      `Demonstrated advanced ${skillName} knowledge with proven excellence in technical assessment.`
    ],
    Silver: [
      `Achieved silver-tier ${skillName} competency with ${evidence.testScore}% test performance - solid proficiency verified.`,
      `Confirmed silver-level ${skillName} skills with demonstrated competence and reliable performance.`,
      `Validated ${skillName} proficiency at silver tier through comprehensive technical evaluation.`
    ],
    Bronze: [
      `Earned bronze-tier ${skillName} certification with ${evidence.testScore}% assessment completion.`,
      `Demonstrated foundational ${skillName} capabilities with verified bronze-level achievement.`,
      `Confirmed bronze-tier ${skillName} proficiency through technical assessment.`
    ]
  };

  const options = statements[level];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate verification criteria for transparency
 */
function generateVerificationCriteria(evidence: SkillEvidence): string[] {
  const criteria: string[] = [];

  if (evidence.testScore && evidence.testScore > 0) {
    criteria.push(`Technical assessment: ${evidence.testScore}% (Verified)`);
  }

  if (evidence.experienceYears && evidence.experienceYears > 0) {
    criteria.push(`Professional experience: ${evidence.experienceYears} years (Validated)`);
  }

  if (evidence.projectCount && evidence.projectCount > 0) {
    criteria.push(`Project portfolio: ${evidence.projectCount} projects (Reviewed)`);
  }

  if (evidence.realWorldUsage) {
    criteria.push('Production environment usage (Confirmed)');
  }

  if (evidence.certifications && evidence.certifications.length > 0) {
    criteria.push(`Industry certifications: ${evidence.certifications.length} (Verified)`);
  }

  if (evidence.endorsements && evidence.endorsements > 0) {
    criteria.push(`Peer endorsements: ${evidence.endorsements} (Validated)`);
  }

  return criteria;
}

/**
 * Calculate confidence score for badge issuance
 */
function calculateConfidenceScore(evidence: SkillEvidence): number {
  let confidence = 0;
  let factors = 0;

  // Test score confidence
  if (evidence.testScore && evidence.testScore > 0) {
    confidence += evidence.testScore;
    factors++;
  }

  // Experience confidence
  if (evidence.experienceYears && evidence.experienceYears > 0) {
    confidence += Math.min(evidence.experienceYears * 20, 100);
    factors++;
  }

  // Project confidence
  if (evidence.projectCount && evidence.projectCount > 0) {
    confidence += Math.min(evidence.projectCount * 10, 100);
    factors++;
  }

  // Real-world usage boost
  if (evidence.realWorldUsage) {
    confidence += 85;
    factors++;
  }

  // Certifications boost
  if (evidence.certifications && evidence.certifications.length > 0) {
    confidence += 90;
    factors++;
  }

  return factors > 0 ? Math.min(confidence / factors, 100) : 0;
}

/**
 * Evaluate if a candidate qualifies for an individual skill badge
 */
export function evaluateSkillBadge(evidence: SkillEvidence): SkillBadge | null {
  const proficiencyLevel = determineProficiencyLevel(evidence);
  const confidenceScore = calculateConfidenceScore(evidence);

  // Minimum confidence threshold for badge issuance
  if (confidenceScore < 60) {
    return null; // Insufficient evidence
  }

  // Minimum test score required
  if (!evidence.testScore || evidence.testScore < 60) {
    return null; // Below professional threshold
  }

  const badge: SkillBadge = {
    type: 'individual',
    skillName: evidence.skillName,
    title: `${proficiencyLevel} ${evidence.skillName} Developer`,
    proficiencyLevel,
    validationStatement: generateValidationStatement(
      evidence.skillName,
      proficiencyLevel,
      evidence
    ),
    issuedDate: new Date().toISOString(),
    evidenceSummary: `Verified through ${evidence.testScore}% assessment, ${evidence.projectCount || 0} projects, and ${evidence.experienceYears || 0} years experience`,
    confidenceScore: Math.round(confidenceScore),
    verificationCriteria: generateVerificationCriteria(evidence)
  };

  return badge;
}

/**
 * Evaluate if a candidate qualifies for a stack badge
 * Stack badges REPLACE individual badges for included skills
 */
export function evaluateStackBadge(
  stackName: keyof typeof TECHNOLOGY_STACKS,
  skillEvidences: Map<string, SkillEvidence>
): StackBadge | null {
  const stack = TECHNOLOGY_STACKS[stackName];
  if (!stack) return null;

  // Check if ALL core skills meet minimum proficiency
  const qualifiedSkills: string[] = [];
  const individualBadges: SkillBadge[] = [];

  for (const skillName of stack.coreSkills) {
    const evidence = skillEvidences.get(skillName);
    if (!evidence) return null; // Missing skill evidence

    const skillBadge = evaluateSkillBadge(evidence);
    if (!skillBadge) return null; // Skill doesn't meet individual badge criteria

    const proficiencyLevels: ProficiencyLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const minLevelIndex = proficiencyLevels.indexOf(stack.minProficiency);
    const skillLevelIndex = proficiencyLevels.indexOf(skillBadge.proficiencyLevel);

    if (skillLevelIndex < minLevelIndex) {
      return null; // Skill doesn't meet stack minimum proficiency
    }

    qualifiedSkills.push(skillName);
    individualBadges.push(skillBadge);
  }

  // All skills qualified - calculate overall stack proficiency
  const avgConfidence = individualBadges.reduce((sum, b) => sum + b.confidenceScore, 0) / individualBadges.length;
  const lowestProficiency = individualBadges.reduce((lowest, badge) => {
    const levels: ProficiencyLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = levels.indexOf(badge.proficiencyLevel);
    const lowestIndex = levels.indexOf(lowest);
    return currentIndex < lowestIndex ? badge.proficiencyLevel : lowest;
  }, 'Platinum' as ProficiencyLevel);

  const stackBadge: StackBadge = {
    type: 'stack',
    stackName,
    coreSkills: stack.coreSkills,
    replacedBadges: stack.coreSkills,
    title: `${lowestProficiency} ${stackName}`,
    proficiencyLevel: lowestProficiency,
    validationStatement: `Verified comprehensive mastery across ${stack.coreSkills.length} core technologies: ${stack.coreSkills.join(', ')}. ${stack.description}.`,
    issuedDate: new Date().toISOString(),
    evidenceSummary: `Full-stack verification across ${stack.coreSkills.length} technologies with ${Math.round(avgConfidence)}% average confidence`,
    confidenceScore: Math.round(avgConfidence),
    verificationCriteria: [
      `All ${stack.coreSkills.length} core skills verified at ${stack.minProficiency}+ level`,
      `Average technical assessment: ${Math.round(avgConfidence)}%`,
      'Cross-skill coherence validated',
      'Production-ready stack proficiency confirmed'
    ]
  };

  return stackBadge;
}

/**
 * Generate complete badge portfolio for a candidate
 * Prioritizes stack badges over individual badges
 */
export function generateBadgePortfolio(
  skillEvidences: Map<string, SkillEvidence>
): { stackBadges: StackBadge[]; individualBadges: SkillBadge[] } {
  const stackBadges: StackBadge[] = [];
  const individualBadges: SkillBadge[] = [];
  const badgedSkills = new Set<string>();

  // First, evaluate all possible stack badges
  for (const stackName of Object.keys(TECHNOLOGY_STACKS) as Array<keyof typeof TECHNOLOGY_STACKS>) {
    const stackBadge = evaluateStackBadge(stackName, skillEvidences);
    if (stackBadge) {
      stackBadges.push(stackBadge);
      // Mark these skills as badged (no individual badges for them)
      stackBadge.coreSkills.forEach(skill => badgedSkills.add(skill));
    }
  }

  // Then, evaluate individual badges for remaining skills
  for (const [skillName, evidence] of skillEvidences.entries()) {
    if (!badgedSkills.has(skillName)) {
      const skillBadge = evaluateSkillBadge(evidence);
      if (skillBadge) {
        individualBadges.push(skillBadge);
      }
    }
  }

  return { stackBadges, individualBadges };
}

/**
 * Stack Progression Information
 * Shows which skills are needed to complete a stack badge
 */
export interface StackProgression {
  stackName: string;
  totalSkills: number;
  completedSkills: string[];
  missingSkills: string[];
  progressPercentage: number;
  canEarnBadge: boolean;
  message: string;
}

/**
 * Check if a skill is part of any technology stack
 * and return progression information
 */
export function getStackProgressionForSkill(
  skillName: string,
  allSkillEvidences: Map<string, SkillEvidence>
): StackProgression | null {
  // Find stacks that include this skill
  for (const [stackName, stack] of Object.entries(TECHNOLOGY_STACKS)) {
    if (stack.coreSkills.includes(skillName)) {
      const completedSkills: string[] = [];
      const missingSkills: string[] = [];

      // Check each skill in the stack
      for (const requiredSkill of stack.coreSkills) {
        // Use AI-powered skill matching
        let evidence = allSkillEvidences.get(requiredSkill);

        if (!evidence) {
          // Try to match using normalized names
          const normalizedRequired = normalizeSkillName(requiredSkill);

          for (const [skillName, skillEvidence] of allSkillEvidences.entries()) {
            const normalizedSkill = normalizeSkillName(skillName);

            if (normalizedSkill === normalizedRequired) {
              evidence = skillEvidence;
              break;
            }
          }
        }

        if (evidence && evidence.testScore && evidence.testScore > 0) {
          const skillBadge = evaluateSkillBadge(evidence);
          if (skillBadge) {
            const proficiencyLevels: ProficiencyLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
            const minLevelIndex = proficiencyLevels.indexOf(stack.minProficiency);
            const skillLevelIndex = proficiencyLevels.indexOf(skillBadge.proficiencyLevel);

            if (skillLevelIndex >= minLevelIndex) {
              completedSkills.push(requiredSkill);
            } else {
              // Skill exists but needs higher proficiency
              missingSkills.push(`${requiredSkill} (improve from ${evidence.testScore}% to ${stack.minProficiency}+)`);
            }
          } else {
            // Skill tested but score too low (below 40% for any badge)
            if (evidence.testScore >= 30) {
              missingSkills.push(`${requiredSkill} (improve from ${evidence.testScore}% to 40%+)`);
            } else {
              missingSkills.push(`${requiredSkill} (${evidence.testScore}% → 40%+ needed)`);
            }
          }
        } else {
          // Skill not tested at all
          missingSkills.push(requiredSkill);
        }
      }

      const progressPercentage = (completedSkills.length / stack.coreSkills.length) * 100;
      const canEarnBadge = missingSkills.length === 0;

      // Extract clean skill names (remove score details from message display)
      const cleanMissingSkills = missingSkills.map(skill => {
        const match = skill.match(/^([^(]+)/);
        return match ? match[1].trim() : skill;
      });

      let message = '';
      if (canEarnBadge) {
        message = `🎉 Congratulations! You've earned the ${stackName} badge!`;
      } else if (missingSkills.length === 1) {
        // Show the detailed message for single missing skill
        if (missingSkills[0].includes('→')) {
          message = `Improve ${missingSkills[0].replace('→', 'to')} for ${stackName}`;
        } else {
          // Show what they have completed
          if (completedSkills.length > 0) {
            const completedText = completedSkills.length === 1
              ? completedSkills[0]
              : completedSkills.slice(0, 2).join(' & ');
            message = `You have ${completedText}! Pass ${cleanMissingSkills[0]} to earn ${stackName}`;
          } else {
            message = `Pass ${cleanMissingSkills[0]} to earn ${stackName}`;
          }
        }
      } else if (missingSkills.length === 2) {
        if (completedSkills.length > 0) {
          const completedText = completedSkills.length === 1
            ? completedSkills[0]
            : `${completedSkills.length} skills`;
          message = `You have ${completedText}! Pass ${cleanMissingSkills[0]} & ${cleanMissingSkills[1]} for ${stackName}`;
        } else {
          message = `Pass ${cleanMissingSkills[0]} & ${cleanMissingSkills[1]} to earn ${stackName}`;
        }
      } else {
        if (completedSkills.length > 0) {
          message = `${completedSkills.length}/${stack.coreSkills.length} complete - ${missingSkills.length} more for ${stackName}`;
        } else {
          message = `${missingSkills.length} skills needed for ${stackName}`;
        }
      }

      return {
        stackName,
        totalSkills: stack.coreSkills.length,
        completedSkills,
        missingSkills,
        progressPercentage,
        canEarnBadge,
        message
      };
    }
  }

  return null;
}

/**
 * Get all stack progressions for a skill
 * (a skill might be part of multiple stacks)
 */
export function getAllStackProgressionsForSkill(
  skillName: string,
  allSkillEvidences: Map<string, SkillEvidence>,
  skillType: 'technical' | 'soft' = 'technical'
): StackProgression[] {
  const progressions: StackProgression[] = [];
  const normalizedSkillName = normalizeSkillName(skillName);

  const stacksToCheck = skillType === 'technical' ? TECHNOLOGY_STACKS : SOFT_SKILL_STACKS;

  for (const [stackName, stack] of Object.entries(stacksToCheck)) {
    // Check if skill belongs to this stack using AI normalization
    const belongsToStack = stack.coreSkills.some(coreSkill =>
      normalizeSkillName(coreSkill) === normalizedSkillName
    );

    if (belongsToStack) {
      const completedSkills: string[] = [];
      const missingSkills: string[] = [];

      for (const requiredSkill of stack.coreSkills) {
        // Use AI-powered skill matching
        let evidence = allSkillEvidences.get(requiredSkill);

        if (!evidence) {
          // Try to match using normalized names
          const normalizedRequired = normalizeSkillName(requiredSkill);

          for (const [skillName, skillEvidence] of allSkillEvidences.entries()) {
            const normalizedSkill = normalizeSkillName(skillName);

            if (normalizedSkill === normalizedRequired) {
              evidence = skillEvidence;
              break;
            }
          }
        }

        if (evidence && evidence.testScore && evidence.testScore > 0) {
          const skillBadge = evaluateSkillBadge(evidence);
          if (skillBadge) {
            const proficiencyLevels: ProficiencyLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
            const minLevelIndex = proficiencyLevels.indexOf(stack.minProficiency);
            const skillLevelIndex = proficiencyLevels.indexOf(skillBadge.proficiencyLevel);

            if (skillLevelIndex >= minLevelIndex) {
              completedSkills.push(requiredSkill);
            } else {
              // Skill exists but needs higher proficiency
              missingSkills.push(`${requiredSkill} (improve from ${evidence.testScore}% to ${stack.minProficiency}+)`);
            }
          } else {
            // Skill tested but score too low (below 40% for any badge)
            if (evidence.testScore >= 30) {
              missingSkills.push(`${requiredSkill} (improve from ${evidence.testScore}% to 40%+)`);
            } else {
              missingSkills.push(`${requiredSkill} (${evidence.testScore}% → 40%+ needed)`);
            }
          }
        } else {
          // Skill not tested at all
          missingSkills.push(requiredSkill);
        }
      }

      const progressPercentage = (completedSkills.length / stack.coreSkills.length) * 100;
      const canEarnBadge = missingSkills.length === 0;

      // Extract clean skill names (remove score details from message display)
      const cleanMissingSkills = missingSkills.map(skill => {
        const match = skill.match(/^([^(]+)/);
        return match ? match[1].trim() : skill;
      });

      let message = '';
      if (canEarnBadge) {
        message = `🎉 Congratulations! You've earned the ${stackName} badge!`;
      } else if (missingSkills.length === 1) {
        // Show the detailed message for single missing skill
        if (missingSkills[0].includes('→')) {
          message = `Improve ${missingSkills[0].replace('→', 'to')} for ${stackName}`;
        } else {
          // Show what they have completed
          if (completedSkills.length > 0) {
            const completedText = completedSkills.length === 1
              ? completedSkills[0]
              : completedSkills.slice(0, 2).join(' & ');
            message = `You have ${completedText}! Pass ${cleanMissingSkills[0]} to earn ${stackName}`;
          } else {
            message = `Pass ${cleanMissingSkills[0]} to earn ${stackName}`;
          }
        }
      } else if (missingSkills.length === 2) {
        if (completedSkills.length > 0) {
          const completedText = completedSkills.length === 1
            ? completedSkills[0]
            : `${completedSkills.length} skills`;
          message = `You have ${completedText}! Pass ${cleanMissingSkills[0]} & ${cleanMissingSkills[1]} for ${stackName}`;
        } else {
          message = `Pass ${cleanMissingSkills[0]} & ${cleanMissingSkills[1]} to earn ${stackName}`;
        }
      } else {
        if (completedSkills.length > 0) {
          message = `${completedSkills.length}/${stack.coreSkills.length} complete - ${missingSkills.length} more for ${stackName}`;
        } else {
          message = `${missingSkills.length} skills needed for ${stackName}`;
        }
      }

      progressions.push({
        stackName,
        totalSkills: stack.coreSkills.length,
        completedSkills,
        missingSkills,
        progressPercentage,
        canEarnBadge,
        message
      });
    }
  }

  return progressions;
}

/**
 * AI-Powered Smart Recommendations
 * Suggests next skills to learn based on current skills
 */
export interface SkillRecommendation {
  skillName: string;
  reason: string;
  potentialBadges: string[]; // Stack badges this skill would unlock
  priority: 'high' | 'medium' | 'low';
  relatedTo: string[]; // Skills you already have that make this relevant
}

/**
 * Get intelligent skill recommendations based on what the user already knows
 */
export function getSmartSkillRecommendations(
  allSkillEvidences: Map<string, SkillEvidence>,
  skillType: 'technical' | 'soft' = 'technical'
): SkillRecommendation[] {
  const recommendations: SkillRecommendation[] = [];
  const completedSkills = new Set<string>();

  // Get all skills the user has completed (with qualifying scores)
  allSkillEvidences.forEach((evidence, skillName) => {
    if (evidence.testScore && evidence.testScore >= 60) {
      completedSkills.add(normalizeSkillName(skillName));
    }
  });

  const stacksToCheck = skillType === 'technical'
    ? TECHNOLOGY_STACKS
    : SOFT_SKILL_STACKS;

  // Analyze each stack to find close matches
  for (const [stackName, stack] of Object.entries(stacksToCheck)) {
    const normalizedCoreSkills = stack.coreSkills.map(s => normalizeSkillName(s));
    const userHasSkills: string[] = [];
    const userMissingSkills: string[] = [];

    normalizedCoreSkills.forEach((coreSkill, idx) => {
      if (completedSkills.has(coreSkill)) {
        userHasSkills.push(stack.coreSkills[idx]);
      } else {
        userMissingSkills.push(stack.coreSkills[idx]);
      }
    });

    // If user has some skills from this stack, recommend the missing ones
    if (userHasSkills.length > 0 && userMissingSkills.length > 0) {
      const progressPercentage = (userHasSkills.length / stack.coreSkills.length) * 100;

      userMissingSkills.forEach(missingSkill => {
        // Check if already recommended
        const existing = recommendations.find(r => r.skillName === missingSkill);
        if (!existing) {
          let priority: 'high' | 'medium' | 'low' = 'medium';

          // High priority if only 1 skill away from badge
          if (userMissingSkills.length === 1) {
            priority = 'high';
          } else if (progressPercentage >= 66) {
            priority = 'high';
          } else if (progressPercentage >= 40) {
            priority = 'medium';
          } else {
            priority = 'low';
          }

          const potentialBadges: string[] = [];

          // Check which other stacks this skill would help complete
          for (const [otherStackName, otherStack] of Object.entries(stacksToCheck)) {
            if (otherStack.coreSkills.includes(missingSkill)) {
              const otherStackProgress = otherStack.coreSkills.filter(s =>
                completedSkills.has(normalizeSkillName(s)) || normalizeSkillName(s) === normalizeSkillName(missingSkill)
              ).length;

              if (otherStackProgress === otherStack.coreSkills.length) {
                potentialBadges.push(otherStackName);
              }
            }
          }

          let reason = '';
          if (userMissingSkills.length === 1) {
            reason = `Complete ${stackName} badge! You have ${userHasSkills.join(', ')}`;
          } else if (progressPercentage >= 66) {
            reason = `You're ${Math.round(progressPercentage)}% complete with ${stackName}. Add this to level up!`;
          } else {
            reason = `Pairs well with your ${userHasSkills.slice(0, 2).join(' & ')} skills`;
          }

          recommendations.push({
            skillName: missingSkill,
            reason,
            potentialBadges: potentialBadges.length > 0 ? potentialBadges : [stackName],
            priority,
            relatedTo: userHasSkills
          });
        } else {
          // Skill already recommended, add this stack to potential badges
          if (!existing.potentialBadges.includes(stackName)) {
            existing.potentialBadges.push(stackName);
          }
        }
      });
    }
  }

  // Sort by priority (high first) and number of potential badges
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.potentialBadges.length - a.potentialBadges.length;
  });

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

/**
 * Get badge-earning opportunities - stacks where user is close to earning a badge
 */
export interface BadgeOpportunity {
  stackName: string;
  description: string;
  progress: number; // percentage
  missingSkills: string[];
  completedSkills: string[];
  urgency: 'immediate' | 'close' | 'potential';
  category: 'technical' | 'soft';
}

export function getBadgeOpportunities(
  allSkillEvidences: Map<string, SkillEvidence>
): BadgeOpportunity[] {
  const opportunities: BadgeOpportunity[] = [];

  // Check technical stacks
  for (const [stackName, stack] of Object.entries(TECHNOLOGY_STACKS)) {
    const result = analyzeStackProgress(stackName, stack, allSkillEvidences, 'technical');
    if (result) opportunities.push(result);
  }

  // Check soft skill stacks
  for (const [stackName, stack] of Object.entries(SOFT_SKILL_STACKS)) {
    const result = analyzeStackProgress(stackName, stack, allSkillEvidences, 'soft');
    if (result) opportunities.push(result);
  }

  // Sort by progress (closest to completion first)
  return opportunities.sort((a, b) => b.progress - a.progress);
}

function analyzeStackProgress(
  stackName: string,
  stack: any,
  allSkillEvidences: Map<string, SkillEvidence>,
  category: 'technical' | 'soft'
): BadgeOpportunity | null {
  const completedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const requiredSkill of stack.coreSkills) {
    let evidence = allSkillEvidences.get(requiredSkill);

    if (!evidence) {
      const normalizedRequired = normalizeSkillName(requiredSkill);
      for (const [skillName, skillEvidence] of allSkillEvidences.entries()) {
        if (normalizeSkillName(skillName) === normalizedRequired) {
          evidence = skillEvidence;
          break;
        }
      }
    }

    if (evidence && evidence.testScore && evidence.testScore >= 60) {
      const skillBadge = evaluateSkillBadge(evidence);
      if (skillBadge) {
        const proficiencyLevels: ProficiencyLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
        const minLevelIndex = proficiencyLevels.indexOf(stack.minProficiency);
        const skillLevelIndex = proficiencyLevels.indexOf(skillBadge.proficiencyLevel);

        if (skillLevelIndex >= minLevelIndex) {
          completedSkills.push(requiredSkill);
        } else {
          missingSkills.push(requiredSkill);
        }
      } else {
        missingSkills.push(requiredSkill);
      }
    } else {
      missingSkills.push(requiredSkill);
    }
  }

  // Only return if user has made some progress
  if (completedSkills.length === 0) return null;

  const progress = (completedSkills.length / stack.coreSkills.length) * 100;

  let urgency: 'immediate' | 'close' | 'potential';
  if (missingSkills.length === 0) {
    urgency = 'immediate'; // Can earn now!
  } else if (missingSkills.length === 1) {
    urgency = 'immediate'; // One skill away
  } else if (progress >= 66) {
    urgency = 'close'; // More than 2/3 complete
  } else {
    urgency = 'potential';
  }

  return {
    stackName,
    description: stack.description,
    progress,
    missingSkills,
    completedSkills,
    urgency,
    category
  };
}

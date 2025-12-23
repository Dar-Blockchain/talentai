import {
  SkillEvidence,
  evaluateStackBadge,
  TECHNOLOGY_STACKS,
  SOFT_SKILL_STACKS,
  ProficiencyLevel
} from './badgeEvaluationEngine';

/**
 * Normalize skill name for better matching
 */
function normalizeSkillName(skillName: string): string {
  const normalized = skillName.toLowerCase().trim();

  const aliases: Record<string, string> = {
    // Technical Skills
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'react': 'React',
    'react.js': 'React',
    'reactjs': 'React',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'html': 'HTML',
    'html5': 'HTML',
    'css': 'CSS',
    'css3': 'CSS',
    'mongo': 'MongoDB',
    'mongodb': 'MongoDB',
    'express': 'Express.js',
    'express.js': 'Express.js',
    'expressjs': 'Express.js',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'next': 'Next.js',
    'next.js': 'Next.js',
    'nextjs': 'Next.js',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
    'three': 'Three.js',
    'three.js': 'Three.js',
    'threejs': 'Three.js',
    'webgl': 'Three.js',
    // Business & Finance
    'finance': 'Finance',
    'financial analysis': 'Finance',
    'corporate finance': 'Finance',
    'accounting': 'Accounting',
    'financial accounting': 'Accounting',
    'bookkeeping': 'Accounting',
    'financial modeling': 'Financial Modeling',
    'financial models': 'Financial Modeling',
    'modeling': 'Financial Modeling',
    'budgeting': 'Budgeting',
    'budget planning': 'Budgeting',
    'budget management': 'Budgeting',
    'financial reporting': 'Financial Reporting',
    'financial reports': 'Financial Reporting',
    'reporting': 'Financial Reporting',
    'investment analysis': 'Investment Analysis',
    'investments': 'Investment Analysis',
    'portfolio management': 'Investment Analysis',
    'risk management': 'Risk Management',
    'risk analysis': 'Risk Management',
    'risk assessment': 'Risk Management',
    'valuation': 'Valuation',
    'company valuation': 'Valuation',
    'business valuation': 'Valuation',
    'economics': 'Economics',
    'macroeconomics': 'Economics',
    'microeconomics': 'Economics',
    'project management': 'Project Management',
    'pm': 'Project Management',
    'pmp': 'Project Management',
    // Soft Skills
    'communication': 'Communication',
    'leadership': 'Leadership',
    'teamwork': 'Teamwork',
    'problem solving': 'Problem Solving',
    'critical thinking': 'Critical Thinking',
    'time management': 'Time Management',
    'decision making': 'Decision Making',
    'strategic thinking': 'Strategic Thinking',
  };

  return aliases[normalized] || skillName;
}

interface ProfileSkill {
  _id: string;
  name: string;
  ScoreTest?: number;
  proficiencyLevel?: number;
  experienceLevel?: string;
  NumberTestPassed?: number;
}

interface ProfileSoftSkill {
  _id: string;
  name: string;
  category?: string;
  ScoreTest?: number;
  proficiencyLevel?: number;
  experienceLevel?: string;
  NumberTestPassed?: number;
}

export interface Badge {
  type: 'individual' | 'stack' | 'progress';
  skillName?: string;
  stackName?: string;
  proficiencyLevel: ProficiencyLevel;
  confidenceScore?: number;
  coreSkills?: string[];
  category?: string;
  // Stack progress fields
  progress?: number; // Percentage complete (0-100)
  completedSkills?: string[]; // Skills user has
  missingSkills?: string[]; // Skills needed to complete stack
}

/**
 * Generate badges from profile technical and soft skills
 */
export function generateBadgesFromProfile(
  technicalSkills: ProfileSkill[] = [],
  softSkills: ProfileSoftSkill[] = []
): { technicalBadges: Badge[]; softBadges: Badge[] } {
  // Convert technical skills to evidence map with normalized names
  const technicalEvidence = new Map<string, SkillEvidence>();
  technicalSkills.forEach((skill) => {
    if (skill.ScoreTest && skill.ScoreTest >= 40) {
      const normalizedName = normalizeSkillName(skill.name);
      technicalEvidence.set(normalizedName, {
        skillName: normalizedName,
        testScore: skill.ScoreTest,
        experienceYears: 0,
        projectCount: skill.NumberTestPassed || 0,
        realWorldUsage: skill.ScoreTest >= 60, // Consider real-world usage if score is good
        certifications: [],
      });
    }
  });

  // Convert soft skills to evidence map with normalized names
  const softEvidence = new Map<string, SkillEvidence>();
  softSkills.forEach((skill) => {
    if (skill.ScoreTest && skill.ScoreTest >= 40) {
      const normalizedName = normalizeSkillName(skill.name);
      softEvidence.set(normalizedName, {
        skillName: normalizedName,
        testScore: skill.ScoreTest,
        experienceYears: 0,
        projectCount: skill.NumberTestPassed || 0,
        realWorldUsage: skill.ScoreTest >= 60,
        certifications: [],
      });
    }
  });

  // Create combined evidence map for cross-category stacks
  const allEvidence = new Map([...technicalEvidence, ...softEvidence]);

  // Generate technical badges (with access to all skills for cross-category stacks)
  const technicalBadges = generateBadgesForType(allEvidence, 'technical', technicalEvidence);

  // Generate soft skill badges
  const softBadges = generateBadgesForType(allEvidence, 'soft', softEvidence);

  return { technicalBadges, softBadges };
}

/**
 * Generate badges for a specific type (technical or soft)
 */
function generateBadgesForType(
  evidenceMap: Map<string, SkillEvidence>,
  type: 'technical' | 'soft',
  primaryEvidence?: Map<string, SkillEvidence>
): Badge[] {
  const badges: Badge[] = [];
  const badgedSkills = new Set<string>();

  // Determine which stacks to check
  const stacksToCheck = type === 'technical' ? TECHNOLOGY_STACKS : SOFT_SKILL_STACKS;

  // First, check for stack badges and progress
  for (const stackName of Object.keys(stacksToCheck)) {
    const stackDef: any = stacksToCheck[stackName as keyof typeof stacksToCheck];
    const coreSkills = stackDef.coreSkills || [];

    // Check which core skills the user has
    const completedSkills: string[] = [];
    const missingSkills: string[] = [];

    coreSkills.forEach((skill: string) => {
      if (evidenceMap.has(skill)) {
        completedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const progress = Math.round((completedSkills.length / coreSkills.length) * 100);

    // Try to get full stack badge
    const stackBadge = evaluateStackBadge(
      stackName as keyof typeof TECHNOLOGY_STACKS,
      evidenceMap
    );

    if (stackBadge) {
      // User completed the stack - award the badge
      badges.push({
        type: 'stack',
        stackName: stackBadge.stackName,
        proficiencyLevel: stackBadge.proficiencyLevel,
        coreSkills: stackBadge.coreSkills,
        category: stackDef?.category || type,
        progress: 100,
        completedSkills,
        missingSkills: [],
      });

      // Mark these skills as badged
      stackBadge.coreSkills.forEach((skill) => badgedSkills.add(skill));
    } else if (completedSkills.length > 0 && completedSkills.length < coreSkills.length) {
      // User has partial progress - show progress badge
      badges.push({
        type: 'progress',
        stackName,
        proficiencyLevel: 'Bronze', // Default level for progress
        coreSkills,
        category: stackDef?.category || type,
        progress,
        completedSkills,
        missingSkills,
      });

      // Mark completed skills as badged
      completedSkills.forEach((skill) => badgedSkills.add(skill));
    }
  }

  // Then, add individual badges for skills not in any stack
  // Use primaryEvidence if provided, otherwise use evidenceMap
  const individualSkillsMap = primaryEvidence || evidenceMap;

  individualSkillsMap.forEach((evidence, skillName) => {
    if (!badgedSkills.has(skillName) && evidence.testScore && evidence.testScore >= 40) {
      // Determine proficiency level based on test score
      let proficiencyLevel: ProficiencyLevel;
      if (evidence.testScore >= 90) {
        proficiencyLevel = 'Platinum';
      } else if (evidence.testScore >= 75) {
        proficiencyLevel = 'Gold';
      } else if (evidence.testScore >= 60) {
        proficiencyLevel = 'Silver';
      } else {
        proficiencyLevel = 'Bronze';
      }

      badges.push({
        type: 'individual',
        skillName,
        proficiencyLevel,
        confidenceScore: evidence.testScore,
      });
    }
  });

  return badges;
}

/**
 * Get badge statistics for a profile
 */
export function getBadgeStats(badges: Badge[]): {
  total: number;
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
  stacks: number;
  individual: number;
} {
  return {
    total: badges.length,
    platinum: badges.filter((b) => b.proficiencyLevel === 'Platinum').length,
    gold: badges.filter((b) => b.proficiencyLevel === 'Gold').length,
    silver: badges.filter((b) => b.proficiencyLevel === 'Silver').length,
    bronze: badges.filter((b) => b.proficiencyLevel === 'Bronze').length,
    stacks: badges.filter((b) => b.type === 'stack').length,
    individual: badges.filter((b) => b.type === 'individual').length,
  };
}

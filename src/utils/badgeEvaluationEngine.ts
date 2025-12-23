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
  // Web Development
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

  // Design Tools
  'Figma': ['figma'],
  'Adobe XD': ['xd', 'adobe xd', 'adobexd'],
  'Photoshop': ['photoshop', 'ps', 'adobe photoshop'],
  'Illustrator': ['illustrator', 'ai', 'adobe illustrator'],
  'InDesign': ['indesign', 'adobe indesign'],
  'After Effects': ['after effects', 'ae', 'adobe after effects'],
  'Premiere Pro': ['premiere', 'premiere pro', 'adobe premiere'],
  'Sketch': ['sketch', 'sketch app'],
  'Prototyping': ['prototyping', 'wireframing', 'mockups'],
  'User Research': ['user research', 'ux research', 'user testing'],
  'Typography': ['typography', 'type design', 'font design'],
  'Animation': ['animation', '2d animation', 'motion design'],
  'Video Editing': ['video editing', 'editing', 'post production'],

  // Mobile Development
  'Swift': ['swift', 'swift language'],
  'iOS Development': ['ios', 'ios development', 'iphone development'],
  'Xcode': ['xcode', 'xcode ide'],
  'UIKit': ['uikit', 'ui kit'],
  'Kotlin': ['kotlin'],
  'Android Development': ['android', 'android development'],
  'Android Studio': ['android studio'],
  'React Native': ['react native', 'react-native', 'rn'],
  'Flutter': ['flutter', 'dart flutter'],
  'Mobile Development': ['mobile development', 'mobile app development'],

  // Data & Analytics
  'Excel': ['excel', 'microsoft excel', 'spreadsheets'],
  'SQL': ['sql', 'structured query language', 'database querying'],
  'Tableau': ['tableau'],
  'Data Visualization': ['data visualization', 'data viz', 'dashboards'],
  'Machine Learning': ['machine learning', 'ml', 'supervised learning'],
  'Statistics': ['statistics', 'statistical analysis', 'stats'],
  'Data Analysis': ['data analysis', 'data analytics', 'analytics'],
  'Business Intelligence': ['business intelligence', 'bi', 'data warehousing'],
  'Requirements Analysis': ['requirements analysis', 'business requirements', 'requirements gathering'],

  // Business & Finance
  'Finance': ['finance', 'financial analysis', 'corporate finance'],
  'Accounting': ['accounting', 'financial accounting', 'bookkeeping'],
  'Financial Modeling': ['financial modeling', 'financial models', 'modeling'],
  'Budgeting': ['budgeting', 'budget planning', 'budget management'],
  'Financial Reporting': ['financial reporting', 'financial reports', 'reporting'],
  'Investment Analysis': ['investment analysis', 'investments', 'portfolio management'],
  'Risk Management': ['risk management', 'risk analysis', 'risk assessment'],
  'Valuation': ['valuation', 'company valuation', 'business valuation'],
  'Economics': ['economics', 'macroeconomics', 'microeconomics'],
  'Project Management': ['project management', 'pm', 'pmp'],

  // Marketing & SEO
  'SEO': ['seo', 'search engine optimization', 'search optimization'],
  'Google Analytics': ['google analytics', 'ga', 'analytics'],
  'Social Media Marketing': ['social media marketing', 'smm', 'social marketing'],
  'Content Marketing': ['content marketing', 'inbound marketing'],
  'Content Writing': ['content writing', 'blog writing', 'article writing'],
  'Copywriting': ['copywriting', 'copy writing', 'advertising copy'],
  'Social Media': ['social media', 'social networks'],
  'Content Strategy': ['content strategy', 'editorial strategy'],
  'Community Management': ['community management', 'community building'],
  'Analytics': ['analytics', 'web analytics', 'marketing analytics'],

  // Security & Testing
  'Network Security': ['network security', 'cybersecurity', 'infosec'],
  'Penetration Testing': ['penetration testing', 'pen testing', 'ethical hacking'],
  'Security Analysis': ['security analysis', 'threat analysis', 'vulnerability assessment'],
  'Encryption': ['encryption', 'cryptography', 'data encryption'],
  'Manual Testing': ['manual testing', 'qa testing', 'functional testing'],
  'Automated Testing': ['automated testing', 'test automation', 'selenium'],
  'Test Planning': ['test planning', 'test strategy', 'test cases'],
  'Bug Tracking': ['bug tracking', 'defect tracking', 'issue tracking'],

  // Blockchain & Web3
  'Solidity': ['solidity', 'solidity language'],
  'Smart Contracts': ['smart contracts', 'blockchain contracts'],
  'Web3': ['web3', 'web3.js', 'web 3.0'],
  'Ethereum': ['ethereum', 'eth', 'ether'],

  // Game Development
  'Unity': ['unity', 'unity3d', 'unity engine'],
  'C#': ['c#', 'csharp', 'c sharp'],
  'Game Design': ['game design', 'level design', 'gameplay design'],
  '3D Modeling': ['3d modeling', '3d modelling', 'blender', 'maya'],

  // AI & Deep Learning
  'Deep Learning': ['deep learning', 'neural networks', 'dl'],
  'TensorFlow': ['tensorflow', 'tf', 'tensor flow'],
  'PyTorch': ['pytorch', 'torch'],
  'NLP': ['nlp', 'natural language processing', 'text processing'],
  'Computer Vision': ['computer vision', 'cv', 'image processing'],
  'Data Science': ['data science', 'data scientist'],

  // DevOps & Cloud (Docker, Kubernetes, AWS already defined above)
  'Azure': ['azure', 'microsoft azure'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'CI/CD': ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'],
  'Jenkins': ['jenkins', 'jenkins ci'],
  'DevOps': ['devops', 'dev ops'],
  'Agile': ['agile', 'agile methodology'],
  'Scrum': ['scrum', 'scrum master'],

  // Programming Languages
  'C++': ['c++', 'cpp', 'cplusplus'],
  'Go': ['go', 'golang'],
  'Rust': ['rust', 'rust language'],
  'Ruby': ['ruby', 'ruby language'],
  'PHP': ['php', 'php language'],

  // Databases (MySQL already defined above)
  'NoSQL': ['nosql', 'no sql', 'document database'],
  'Redis': ['redis', 'cache'],
  'GraphQL': ['graphql', 'graph ql'],
  'REST API': ['rest api', 'rest', 'restful', 'restful api'],

  // Frontend Tools
  'Sass': ['sass', 'scss'],
  'Webpack': ['webpack', 'bundler'],
  'Jest': ['jest', 'jest testing'],
  'Mocha': ['mocha', 'mocha testing'],
  'Cypress': ['cypress', 'cypress testing'],
  'Playwright': ['playwright', 'playwright testing'],

  // Backend Frameworks
  'Laravel': ['laravel', 'php laravel'],

  // Web3 Additional
  'DeFi': ['defi', 'decentralized finance', 'defi protocol'],
  'NFTs': ['nft', 'nfts', 'non-fungible token'],
  'Hardhat': ['hardhat'],
  'Truffle': ['truffle', 'truffle suite'],
  'Token Economics': ['token economics', 'tokenomics'],
  'DAO Governance': ['dao', 'dao governance', 'decentralized autonomous organization'],
  'Polkadot': ['polkadot', 'dot'],
  'Solana': ['solana', 'sol'],
  'Polygon': ['polygon', 'matic'],

  // Sales & Business
  'Sales': ['sales', 'selling', 'sales strategy'],
  'Negotiation': ['negotiation', 'negotiating', 'deal making'],
  'Customer Success': ['customer success', 'customer satisfaction', 'cs'],
  'Operations': ['operations', 'ops', 'business operations'],
  'Entrepreneurship': ['entrepreneurship', 'entrepreneur', 'startup'],
  'Product Management': ['product management', 'product manager'],
  'Strategy': ['strategy', 'strategic planning', 'business strategy'],
  'Business Analysis': ['business analysis', 'business analyst'],
  'Email Marketing': ['email marketing', 'email campaigns'],
  'Branding': ['branding', 'brand strategy'],
  'Market Research': ['market research', 'market analysis'],
  'Advertising': ['advertising', 'ad campaigns'],
  'Digital Marketing': ['digital marketing', 'online marketing'],
  'Growth Hacking': ['growth hacking', 'growth marketing'],
  'Influencer Marketing': ['influencer marketing', 'influencer relations'],

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
  },
  // Design & Creative
  'UI/UX Designer': {
    coreSkills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Complete UI/UX design workflow',
    category: 'design'
  },
  'Graphic Designer': {
    coreSkills: ['Photoshop', 'Illustrator', 'InDesign', 'Typography'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Professional graphic design mastery',
    category: 'design'
  },
  'Motion Graphics': {
    coreSkills: ['After Effects', 'Premiere Pro', 'Animation', 'Video Editing'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Motion design and video production',
    category: 'design'
  },
  // Data & Analytics
  'Data Analyst': {
    coreSkills: ['Excel', 'SQL', 'Tableau', 'Data Visualization'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Data analysis and business intelligence',
    category: 'data'
  },
  'Data Scientist': {
    coreSkills: ['Python', 'Machine Learning', 'Statistics', 'Data Analysis'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Advanced data science and ML',
    category: 'data'
  },
  'Business Analyst': {
    coreSkills: ['Excel', 'SQL', 'Business Intelligence', 'Requirements Analysis'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Business analysis and strategy',
    category: 'business'
  },
  // Business & Finance
  'Financial Analyst': {
    coreSkills: ['Finance', 'Financial Modeling', 'Excel', 'Financial Reporting'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Financial analysis and reporting',
    category: 'business'
  },
  'Accountant': {
    coreSkills: ['Accounting', 'Financial Reporting', 'Budgeting', 'Excel'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Accounting and financial management',
    category: 'business'
  },
  'Investment Analyst': {
    coreSkills: ['Investment Analysis', 'Finance', 'Valuation', 'Financial Modeling'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Investment analysis and portfolio management',
    category: 'business'
  },
  'Project Manager': {
    coreSkills: ['Project Management', 'Leadership', 'Communication', 'Time Management'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Project planning and execution',
    category: 'business'
  },
  // Mobile Development
  'iOS Developer': {
    coreSkills: ['Swift', 'iOS Development', 'Xcode', 'UIKit'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Native iOS app development',
    category: 'mobile'
  },
  'Android Developer': {
    coreSkills: ['Kotlin', 'Android Development', 'Android Studio', 'Java'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Native Android app development',
    category: 'mobile'
  },
  'Cross-Platform Mobile': {
    coreSkills: ['React Native', 'Flutter', 'Mobile Development', 'JavaScript'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Cross-platform mobile apps',
    category: 'mobile'
  },
  // Marketing & Content
  'Digital Marketer': {
    coreSkills: ['SEO', 'Google Analytics', 'Social Media Marketing', 'Content Marketing'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Comprehensive digital marketing',
    category: 'marketing'
  },
  'Content Creator': {
    coreSkills: ['Content Writing', 'Copywriting', 'SEO', 'Social Media'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Content creation and strategy',
    category: 'marketing'
  },
  'Social Media Manager': {
    coreSkills: ['Social Media Marketing', 'Content Strategy', 'Analytics', 'Community Management'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Social media strategy and management',
    category: 'marketing'
  },
  // Security & Testing
  'Cybersecurity Specialist': {
    coreSkills: ['Network Security', 'Penetration Testing', 'Security Analysis', 'Encryption'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Cybersecurity and ethical hacking',
    category: 'security'
  },
  'QA Engineer': {
    coreSkills: ['Manual Testing', 'Automated Testing', 'Test Planning', 'Bug Tracking'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Quality assurance and testing',
    category: 'testing'
  },
  // Blockchain & Web3
  'Blockchain Developer': {
    coreSkills: ['Solidity', 'Smart Contracts', 'Web3', 'Ethereum'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Blockchain and cryptocurrency development',
    category: 'blockchain'
  },
  // Game Development
  'Game Developer': {
    coreSkills: ['Unity', 'C#', 'Game Design', '3D Modeling'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Video game development',
    category: 'gaming'
  },
  // AI & Machine Learning
  'AI Engineer': {
    coreSkills: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'Python'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Artificial intelligence and ML engineering',
    category: 'ai'
  },
  // DevOps & Cloud
  'Cloud Architect': {
    coreSkills: ['AWS', 'Azure', 'GCP', 'DevOps'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Cloud infrastructure and architecture',
    category: 'technical'
  },
  // Web3 & Blockchain
  'DeFi Developer': {
    coreSkills: ['Solidity', 'Smart Contracts', 'DeFi', 'Web3'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'DeFi protocol development',
    category: 'blockchain'
  },
  'NFT Developer': {
    coreSkills: ['Solidity', 'Smart Contracts', 'NFTs', 'Ethereum'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'NFT and digital collectibles',
    category: 'blockchain'
  },
  'Web3 Marketer': {
    coreSkills: ['Web3', 'Token Economics', 'Community Management', 'Social Media Marketing'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Web3 and crypto marketing',
    category: 'marketing'
  },
  // Sales & Product
  'Product Manager': {
    coreSkills: ['Product Management', 'Strategy', 'Business Analysis', 'Agile'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Product strategy and management',
    category: 'business'
  },
  'Sales Executive': {
    coreSkills: ['Sales', 'Negotiation', 'Customer Success', 'Communication'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Sales and business development',
    category: 'business'
  },
  // Data Science
  'ML Engineer': {
    coreSkills: ['Machine Learning', 'PyTorch', 'TensorFlow', 'Python'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Machine learning engineering',
    category: 'ai'
  },
  'NLP Specialist': {
    coreSkills: ['NLP', 'Python', 'Machine Learning', 'Deep Learning'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Natural language processing',
    category: 'ai'
  },
  'Computer Vision Engineer': {
    coreSkills: ['Computer Vision', 'Deep Learning', 'Python', 'PyTorch'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Computer vision and image processing',
    category: 'ai'
  },
  // Marketing Specialist
  'Growth Marketer': {
    coreSkills: ['Growth Hacking', 'SEO', 'Google Analytics', 'Digital Marketing'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Growth and performance marketing',
    category: 'marketing'
  },
  'Email Marketing Specialist': {
    coreSkills: ['Email Marketing', 'Copywriting', 'Analytics', 'Marketing'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Email campaigns and automation',
    category: 'marketing'
  },
  'Brand Manager': {
    coreSkills: ['Branding', 'Market Research', 'Strategy', 'Advertising'],
    minProficiency: 'Silver' as ProficiencyLevel,
    description: 'Brand strategy and management',
    category: 'marketing'
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

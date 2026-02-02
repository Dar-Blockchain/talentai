const mongoose = require('mongoose');
const User = require('../models/UserModel');
const Profile = require('../models/ProfileModel');
require('dotenv').config();

// AI-related skills with different proficiency levels
const AI_SKILLS = [
  { name: 'Prompt Engineering', category: 'AI' },
  { name: 'LLMs Configuration', category: 'AI' },
  { name: 'Machine Learning', category: 'AI' },
  { name: 'Deep Learning', category: 'AI' },
  { name: 'Natural Language Processing', category: 'AI' },
  { name: 'Computer Vision', category: 'AI' },
  { name: 'PyTorch', category: 'ML Framework' },
  { name: 'TensorFlow', category: 'ML Framework' },
  { name: 'LangChain', category: 'AI Tool' },
  { name: 'OpenAI API', category: 'AI Tool' },
  { name: 'HuggingFace', category: 'AI Tool' },
  { name: 'RAG Systems', category: 'AI' },
  { name: 'Vector Databases', category: 'AI' },
  { name: 'Model Fine-tuning', category: 'AI' }
];

const FRONTEND_SKILLS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' }
];

const BACKEND_SKILLS = [
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Express.js', category: 'Backend' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'PostgreSQL', category: 'Database' }
];

const SOFT_SKILLS = [
  { name: 'Communication', category: 'Interpersonal' },
  { name: 'Problem Solving', category: 'Cognitive' },
  { name: 'Team Collaboration', category: 'Interpersonal' },
  { name: 'Adaptability', category: 'Personal' },
  { name: 'Critical Thinking', category: 'Cognitive' },
  { name: 'Time Management', category: 'Personal' },
  { name: 'Leadership', category: 'Interpersonal' },
  { name: 'Creativity', category: 'Cognitive' }
];

const EXPERIENCE_LEVELS = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'];
const COUNTRIES = ['USA', 'UK', 'France', 'Germany', 'Canada', 'Netherlands', 'Spain', 'Portugal'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const CONTRACT_TYPES = ['Full-time', 'Contract', 'Part-time'];

// Helper function to generate random number in range
const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to pick random items from array
const pickRandom = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate candidate data based on level
const generateCandidateProfile = (level, index) => {
  let levelConfirmedRange, scoreRange, experienceLevel, aiSkillCount, frontendSkillCount, backendSkillCount;

  // Low score candidates (20-40%)
  if (level === 'junior') {
    levelConfirmedRange = [1, 2];
    scoreRange = [20, 40];
    experienceLevel = pickRandom(['Entry Level', 'Junior'], 1)[0];
    aiSkillCount = randomInRange(2, 4);
    frontendSkillCount = randomInRange(1, 2);
    backendSkillCount = randomInRange(1, 2);
  }
  // Medium score candidates (50-70%)
  else if (level === 'mid') {
    levelConfirmedRange = [2, 3];
    scoreRange = [50, 70];
    experienceLevel = pickRandom(['Junior', 'Mid Level'], 1)[0];
    aiSkillCount = randomInRange(4, 6);
    frontendSkillCount = randomInRange(2, 3);
    backendSkillCount = randomInRange(2, 3);
  }
  // High score candidates (80-95%)
  else {
    levelConfirmedRange = [4, 5];
    scoreRange = [80, 95];
    experienceLevel = pickRandom(['Senior', 'Expert'], 1)[0];
    aiSkillCount = randomInRange(6, 10);
    frontendSkillCount = randomInRange(3, 4);
    backendSkillCount = randomInRange(3, 4);
  }

  const firstName = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
    'Sam', 'Drew', 'Charlie', 'Jamie', 'Skylar', 'Dakota', 'Reese', 'Sage',
    'Phoenix', 'Cameron', 'Rowan', 'Emerson', 'Kai', 'Blake', 'River', 'Ash',
    'Harper', 'Finley', 'Hayden', 'Logan', 'Parker', 'Dylan'
  ][index];

  const lastName = [
    'Chen', 'Kumar', 'Garcia', 'Patel', 'Kim', 'Nguyen', 'Smith', 'Johnson',
    'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Walker', 'Hall', 'Allen', 'Young'
  ][index];

  // Generate skills
  const selectedAISkills = pickRandom(AI_SKILLS, aiSkillCount);
  const selectedFrontendSkills = pickRandom(FRONTEND_SKILLS, frontendSkillCount);
  const selectedBackendSkills = pickRandom(BACKEND_SKILLS, backendSkillCount);

  const allSkills = [...selectedAISkills, ...selectedFrontendSkills, ...selectedBackendSkills];

  const skills = allSkills.map((skill, idx) => {
    const levelConfirmed = randomInRange(...levelConfirmedRange);
    const scoreTest = randomInRange(...scoreRange);

    return {
      name: skill.name,
      proficiencyLevel: levelConfirmed,
      experienceLevel: experienceLevel,
      NumberTestPassed: randomInRange(1, 5),
      ScoreTest: scoreTest,
      Levelconfirmed: levelConfirmed,
      isPrimary: idx < 3 // First 3 skills are primary
    };
  });

  // Generate soft skills
  const selectedSoftSkills = pickRandom(SOFT_SKILLS, randomInRange(4, 6));
  const softSkills = selectedSoftSkills.map(skill => ({
    name: skill.name,
    category: skill.category,
    proficiencyLevel: randomInRange(...levelConfirmedRange),
    experienceLevel: experienceLevel,
    ScoreTest: randomInRange(...scoreRange),
    isPrimary: false,
    Levelconfirmed: randomInRange(...levelConfirmedRange)
  }));

  // Generate salary based on experience
  let salaryMin, salaryMax;
  if (level === 'junior') {
    salaryMin = randomInRange(30000, 45000);
    salaryMax = salaryMin + randomInRange(10000, 20000);
  } else if (level === 'mid') {
    salaryMin = randomInRange(50000, 70000);
    salaryMax = salaryMin + randomInRange(15000, 30000);
  } else {
    salaryMin = randomInRange(80000, 120000);
    salaryMax = salaryMin + randomInRange(20000, 50000);
  }

  const country = pickRandom(COUNTRIES, 1)[0];
  const workMode = pickRandom(WORK_MODES, 1)[0];
  const contractType = pickRandom(CONTRACT_TYPES, 1)[0];

  return {
    firstName,
    lastName,
    age: String(randomInRange(22, 45)),
    gender: pickRandom(['Male', 'Female', 'Other'], 1)[0],
    educationLevel: pickRandom(['Bachelor', 'Master', 'PhD'], 1)[0],
    country,
    language: 'English',
    timeZone: 'UTC',
    expectedSalary: {
      min: salaryMin,
      max: salaryMax,
      currency: pickRandom(['EUR', 'USD'], 1)[0]
    },
    preferredContractType: contractType,
    workModePreference: workMode,
    contactInformation: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1${randomInRange(1000000000, 9999999999)}`,
      location: `${country}`,
      linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      githubUrl: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`
    },
    readyForMatch: true,
    skills,
    softSkills,
    targetRole: level === 'senior' ? 'AI Senior Developer' : level === 'mid' ? 'AI Developer' : 'AI Junior Developer'
  };
};

// Main seeding function
const seedAICandidates = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing test candidates (optional)
    console.log('🗑️  Checking for existing test candidates...');

    const candidates = [];

    // Generate 10 junior candidates (score 20-40%)
    console.log('👶 Creating 10 Junior AI candidates...');
    for (let i = 0; i < 10; i++) {
      candidates.push({ level: 'junior', index: i });
    }

    // Generate 10 mid-level candidates (score 50-70%)
    console.log('👔 Creating 10 Mid-level AI candidates...');
    for (let i = 10; i < 20; i++) {
      candidates.push({ level: 'mid', index: i });
    }

    // Generate 10 senior candidates (score 80-95%)
    console.log('🎓 Creating 10 Senior AI candidates...');
    for (let i = 20; i < 30; i++) {
      candidates.push({ level: 'senior', index: i });
    }

    // Create users and profiles
    for (const { level, index } of candidates) {
      const profileData = generateCandidateProfile(level, index);

      // Create user
      const user = await User.create({
        username: `${profileData.firstName.toLowerCase()}_${profileData.lastName.toLowerCase()}`,
        email: profileData.contactInformation.email,
        isVerified: true,
        role: 'Candidate',
        lastLogin: new Date()
      });

      // Create profile
      await Profile.create({
        userId: user._id,
        type: 'Candidate',
        ...profileData
      });

      console.log(`✅ Created candidate: ${profileData.firstName} ${profileData.lastName} (${level})`);
    }

    console.log('\n🎉 Successfully seeded 30 AI candidate profiles!');
    console.log('📊 Distribution:');
    console.log('   - 10 Junior candidates (20-40% match score)');
    console.log('   - 10 Mid-level candidates (50-70% match score)');
    console.log('   - 10 Senior candidates (80-95% match score)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding candidates:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAICandidates();

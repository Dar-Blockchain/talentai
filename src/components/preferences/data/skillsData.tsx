import CodeIcon from "@mui/icons-material/Code";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CampaignIcon from "@mui/icons-material/Campaign";
import BugReportIcon from "@mui/icons-material/BugReport";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

// --- Skills ---
export const ALL_SKILLS = [
  // Development
  { label: "JavaScript", category: "development" },
  { label: "TypeScript", category: "development" },
  { label: "React", category: "development" },
  { label: "Node.js", category: "development" },
  { label: "Python", category: "development" },
  { label: "Django", category: "development" },
  { label: "Flask", category: "development" },
  { label: "Java", category: "development" },
  { label: "Spring Boot", category: "development" },
  { label: "C#", category: "development" },
  { label: ".NET", category: "development" },
  { label: "PHP", category: "development" },
  { label: "Laravel", category: "development" },
  { label: "Ruby", category: "development" },
  { label: "Ruby on Rails", category: "development" },
  { label: "Go", category: "development" },
  { label: "Rust", category: "development" },
  { label: "C++", category: "development" },
  { label: "C", category: "development" },
  { label: "Swift", category: "development" },
  { label: "Kotlin", category: "development" },
  { label: "GraphQL", category: "development" },
  { label: "REST API", category: "development" },
  { label: "MongoDB", category: "development" },
  { label: "PostgreSQL", category: "development" },
  { label: "MySQL", category: "development" },
  { label: "Redis", category: "development" },
  { label: "Docker", category: "development" },
  { label: "Kubernetes", category: "development" },
  { label: "AWS", category: "development" },
  { label: "Azure", category: "development" },
  { label: "Google Cloud", category: "development" },
  { label: "Git", category: "development" },
  { label: "CI/CD", category: "development" },
  { label: "Jest", category: "development" },
  { label: "Cypress", category: "development" },
  { label: "Webpack", category: "development" },
  { label: "Vite", category: "development" },
  { label: "Tailwind CSS", category: "development" },
  { label: "Material-UI", category: "development" },
  { label: "Bootstrap", category: "development" },
  { label: "Sass", category: "development" },
  { label: "Redux", category: "development" },
  // Marketing
  { label: "SEO", category: "marketing" },
  { label: "Content Marketing", category: "marketing" },
  { label: "Social Media", category: "marketing" },
  { label: "Email Marketing", category: "marketing" },
  { label: "Analytics", category: "marketing" },
  { label: "Web3 Marketing", category: "marketing" },
  { label: "NFT Marketing", category: "marketing" },
  { label: "Community Management", category: "marketing" },
  { label: "Token Economics", category: "marketing" },
  { label: "DeFi Marketing", category: "marketing" },
  { label: "Crypto PR", category: "marketing" },
  { label: "Blockchain Events", category: "marketing" },
  { label: "DAO Governance", category: "marketing" },
  // QA
  { label: "Manual Testing", category: "qa" },
  { label: "Automated Testing", category: "qa" },
  { label: "Test Planning", category: "qa" },
  { label: "Performance Testing", category: "qa" },
  { label: "API Testing", category: "qa" },
  { label: "Security Testing", category: "qa" },
  // Business
  { label: "Project Management", category: "business" },
  { label: "Agile", category: "business" },
  { label: "Scrum", category: "business" },
  { label: "Product Management", category: "business" },
  { label: "Business Analysis", category: "business" },
  // Web3
  { label: "Hedera", category: "web3" },
  { label: "Solidity", category: "web3" },
  { label: "Ethereum", category: "web3" },
  { label: "Smart Contracts", category: "web3" },
  { label: "DeFi", category: "web3" },
  { label: "NFTs", category: "web3" },
  { label: "Web3.js", category: "web3" },
  { label: "Hardhat", category: "web3" },
  { label: "Truffle", category: "web3" },
  { label: "Massa", category: "web3" },
  { label: "Polkadot", category: "web3" },
  { label: "NEAR", category: "web3" },
  { label: "Substrate", category: "web3" },
  { label: "Cosmos", category: "web3" },
  { label: "Solana", category: "web3" },
  { label: "Avalanche", category: "web3" },
  { label: "Polygon", category: "web3" },
  { label: "Arbitrum", category: "web3" },
  { label: "Optimism", category: "web3" },
  { label: "Base", category: "web3" },
  // AI
  { label: "Machine Learning", category: "ai" },
  { label: "Deep Learning", category: "ai" },
  { label: "TensorFlow", category: "ai" },
  { label: "PyTorch", category: "ai" },
  { label: "Keras", category: "ai" },
  { label: "Scikit-learn", category: "ai" },
  { label: "Natural Language Processing", category: "ai" },
  { label: "Computer Vision", category: "ai" },
  { label: "Reinforcement Learning", category: "ai" },
  { label: "Data Science", category: "ai" },
  { label: "Neural Networks", category: "ai" },
  { label: "OpenAI", category: "ai" },
  { label: "LangChain", category: "ai" },
  { label: "Hugging Face", category: "ai" },
  { label: "MLOps", category: "ai" },
  { label: "Data Analysis", category: "ai" },
  { label: "Pandas", category: "ai" },
  { label: "NumPy", category: "ai" },
  { label: "Jupyter", category: "ai" },
  { label: "Data Visualization", category: "ai" },
  { label: "Big Data", category: "ai" },
  { label: "Apache Spark", category: "ai" },
  { label: "Hadoop", category: "ai" },
  { label: "AI Ethics", category: "ai" },
  { label: "Generative AI", category: "ai" },
  { label: "LLM Fine-tuning", category: "ai" },
  { label: "Prompt Engineering", category: "ai" },
];

// --- Categories ---
export const CATEGORIES = [
  { id: "development", label: "Development", icon: <CodeIcon /> },
  { id: "web3", label: "Web3", icon: <AccountTreeIcon /> },
  { id: "ai", label: "AI", icon: <SmartToyIcon /> },
  { id: "marketing", label: "Marketing", icon: <CampaignIcon /> },
  { id: "qa", label: "Quality Assurance", icon: <BugReportIcon /> },
  { id: "business", label: "Business", icon: <BusinessCenterIcon /> },
];

// --- Helper to group skills by category ---
export const skillsByCategory: Record<string, string[]> = {};
CATEGORIES.forEach((cat) => {
  skillsByCategory[cat.id] = ALL_SKILLS.filter((s) => s.category === cat.id).map(
    (s) => s.label
  );
});

// --- Soft Skills ---
export const SOFT_SKILLS = [
  // Communication
  { label: "Communication", category: "soft-skills" },
  { label: "Verbal Communication", category: "soft-skills" },
  { label: "Written Communication", category: "soft-skills" },
  { label: "Presentation Skills", category: "soft-skills" },
  { label: "Negotiation Skills", category: "soft-skills" },

  // Leadership
  { label: "Leadership", category: "soft-skills" },
  { label: "Team Management", category: "soft-skills" },
  { label: "Decision Making", category: "soft-skills" },
  { label: "Task Delegation", category: "soft-skills" },
  { label: "Team Motivation", category: "soft-skills" },

  // Problem Solving
  { label: "Problem Solving", category: "soft-skills" },
  { label: "Analytical Thinking", category: "soft-skills" },
  { label: "Critical Thinking", category: "soft-skills" },
  { label: "Creative Problem Solving", category: "soft-skills" },
  { label: "Strategic Planning", category: "soft-skills" },

  // Teamwork
  { label: "Teamwork", category: "soft-skills" },
  { label: "Collaboration", category: "soft-skills" },
  { label: "Conflict Resolution", category: "soft-skills" },
  { label: "Adaptability", category: "soft-skills" },
  { label: "Cultural Awareness", category: "soft-skills" },

  // Time Management
  { label: "Time Management", category: "soft-skills" },
  { label: "Task Prioritization", category: "soft-skills" },
  { label: "Scheduling", category: "soft-skills" },
  { label: "Deadline Management", category: "soft-skills" },
  { label: "Work-Life Balance", category: "soft-skills" },
];


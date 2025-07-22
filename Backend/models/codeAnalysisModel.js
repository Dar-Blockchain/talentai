const mongoose = require('mongoose');

// Sub-schema for projectPurpose (from intelligentAnalyzer.js: purposeAnalysis)
const ProjectPurposeSchema = new mongoose.Schema({
  domain: String,
  type: String,
  complexity: String,
  target: String,
  confidence: Number,
  description: String,
  features: [String],
  technologies: [String],
  keyFiles: [String],
  conclusion: String
}, { _id: false });

// Sub-schema for architecture (from intelligentAnalyzer.js: architectureAnalysis)
const ArchitectureSchema = new mongoose.Schema({
  pattern: String,
  layers: [String],
  patterns: [String],
  quality: Number,
  strengths: [String],
  weaknesses: [String],
  structure: {
    rootFiles: [String],
    srcStructure: {
      components: [String],
      services: [String],
      utils: [String],
      types: [String],
      hooks: [String],
      pages: [String],
      assets: [String]
    },
    configFiles: [String],
    documentation: [String],
    testing: [String],
    deployment: [String]
  }
}, { _id: false });

// Sub-schema for coherence
const CoherenceSchema = new mongoose.Schema({
  consistency: Number,
  naming: Number,
  structure: Number,
  patterns: Number
}, { _id: false });

// Sub-schema for quality
const QualitySchema = new mongoose.Schema({
  overall: Number,
  maintainability: Number,
  readability: Number,
  performance: Number,
  security: Number,
  testability: Number
}, { _id: false });

// Sub-schema for insights
const InsightSchema = new mongoose.Schema({
  type: String,
  title: String,
  message: String,
  confidence: Number,
  category: String,
}, { _id: false });

// Sub-schema for structure
const StructureSchema = new mongoose.Schema({
  files: mongoose.Schema.Types.Mixed,
  directories: mongoose.Schema.Types.Mixed,
  allFiles: [String],         // <-- Added to match intelligentAnalyzer.js
  allDirectories: [String],   // <-- Added to match intelligentAnalyzer.js
  fileContents: mongoose.Schema.Types.Mixed,
  // analysis: mongoose.Schema.Types.Mixed
}, { _id: false });

// Main analysis schema
const AnalysisSchema = new mongoose.Schema({
  projectPurpose: ProjectPurposeSchema,
  architecture: ArchitectureSchema,
  coherence: CoherenceSchema,
  quality: QualitySchema,
  insights: [InsightSchema],
  structure: StructureSchema
}, { _id: false });

const CodeAnalysisSchema = new mongoose.Schema({
  githubLink: { type: String, required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  analysis: { type: AnalysisSchema, required: true },
  
  contributors: [{ type: String }], // or use an object if you want more details per contributor
  totalCommits: { type: Number },
  firstCommit: { type: Date },
  lastCommit: { type: Date },
  startDateCheck: { type: String }, // e.g., 'PASS' or 'FAIL'
  deadlineCheck: { type: String },
  maxTeamSizeCheck: { type: String },
  mustBeOriginalCheck: { type: String },
  demoRequiredCheck: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodeAnalysis', CodeAnalysisSchema);
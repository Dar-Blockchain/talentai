const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  year: { type: String },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String },
  position: { type: String },
  description: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  technologies: [{ type: String }],
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  link: { type: String },
});

const linksSchema = new mongoose.Schema({
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  portfolio: { type: String, default: "" },
});

const cvAnalysisSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },

    // Professional Summary
    title: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },

    // Career Information
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    seniority: {
      type: String,
      default: "Entry-Level",
    },

    // Skills
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Languages
    spokenLanguages: [
      {
        type: String,
        trim: true,
      },
    ],

    // Experience
    experience: [experienceSchema],

    // Education
    education: [educationSchema],

    // Certifications
    certifications: [
      {
        type: String,
        trim: true,
      },
    ],

    // Projects
    projects: [projectSchema],

    // Contact Links
    links: linksSchema,

    // Analysis Metadata
    analysisStatus: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "completed",
    },
    analysisScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    analysisNotes: {
      type: String,
      default: "",
    },

    // Reference Information
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },

    // Tracking
    ipAddress: { type: String },
    userAgent: { type: String },
    sourceUrl: { type: String },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "cv_analysis",
  }
);

// Indexes for better query performance
cvAnalysisSchema.index({ email: 1 });
cvAnalysisSchema.index({ name: 1 });
cvAnalysisSchema.index({ User: 1 });
cvAnalysisSchema.index({ Company: 1 });
cvAnalysisSchema.index({ createdAt: -1 });
cvAnalysisSchema.index({ seniority: 1 });
cvAnalysisSchema.index({ skills: 1 });

module.exports = mongoose.model("CVAnalysis", cvAnalysisSchema);

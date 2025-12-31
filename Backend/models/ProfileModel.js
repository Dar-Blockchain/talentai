const mongoose = require("mongoose");
const TodoList = require("../models/todoListModel");

// Sub-schemas for skills and softSkills to enable per-item timestamps
const skillSchema = new mongoose.Schema(
  {
    name: String,
    proficiencyLevel: Number,
    experienceLevel: String,
    NumberTestPassed: Number,
    ScoreTest: Number,
    Levelconfirmed: Number,
    isPrimary: Boolean,
  },
  { timestamps: true }
);


const softSkillSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    proficiencyLevel: Number, // 0-5
    experienceLevel: String, // NoLevel , Entry Level..
    ScoreTest: Number,
    isPrimary: Boolean,
    Levelconfirmed: Number,
  },
  { timestamps: true }
);

const profileSchema = new mongoose.Schema(
  {
    // ========== IDENTIFICATION & BASIC INFO ==========
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Candidate", "Company"],
      required: true,
    },
    user_image: { type: String, required: false, default: "client.png" },

    // ========== PERSONAL INFORMATION ==========
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    age: { type: String, required: false },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      required: false,
    },
    educationLevel: { type: String, required: false },
    country: { type: String, required: false },
    language: { type: String, required: false },
    timeZone: { type: String, required: false },

    // ========== CONTACT INFORMATION ==========
    contactInformation: {
      email: { type: String, required: false },
      phone: { type: String, required: false },
      address: { type: String, required: false },
      linkedinUrl: { type: String, required: false },
      githubUrl: { type: String, required: false },
      personalWebsite: { type: String, required: false },
      location: { type: String, required: false },
    },

    // ========== WORK PREFERENCES ==========
    preferredContractType: { type: String, required: false },
    workModePreference: {
      type: String,
      required: false,
    },

    // ========== SALARY & COMPENSATION ==========
    expectedSalary: {
      min: { type: Number, required: false },
      max: { type: Number, required: false },
      currency: { type: String, required: false, default: "EUR" },
    },

    // ========== SKILLS & COMPETENCIES ==========
    skills: [skillSchema],
    softSkills: [softSkillSchema],

    // ========== PROFILE MANAGEMENT ==========
    quota: { type: Number, default: 0 },
    quotaUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    readyForMatch: { type: Boolean, default: false },
    isPublicProfile: { type: Boolean, default: false, index: true },

    // ========== REFERENCES & ASSOCIATIONS ==========
    todoList: { type: mongoose.Schema.Types.ObjectId, ref: "TodoList" },
    interviewDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InterviewAssessment" },
    ],
    assessmentResults: [
      { type: mongoose.Schema.Types.ObjectId, ref: "JobAssessmentResult" },
    ],

    // ========== COMPANY SPECIFIC FIELDS ==========
    companyDetails: {
      email: String,
      name: String,
      industry: String,
      size: String,
      location: String,
      website: String,
      linkedin: String,
      employmentType: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site"],
        required: false,
      },
    },
    requiredSkills: [String],
    requiredExperienceLevel: {
      type: String,
      enum: ["Entry Level", "Junior", "Mid Level", "Senior", "Expert"],
    },
    targetRole: {
      type: String,
      default: "",
    },

    // ========== BIDDING INFORMATION ==========
    companyBid: {
      finalBid: Number,
      dateBid: Date,
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    },
    usersBidedByCompany: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

profileSchema.post("save", async function (doc) {
  try {
    if (doc.type === "Candidate" && !doc.todoList) {
      const todoList = await TodoList.create({ profile: doc._id });

      await mongoose.model("Profile").findByIdAndUpdate(doc._id, {
        todoList: todoList._id,
      });
    }
  } catch (error) {
    console.error("Error creating TodoList:", error);
  }
});

// Index to speed up queries filtering by visibility
profileSchema.index({ isPublicProfile: 1 });

module.exports = mongoose.model("Profile", profileSchema);

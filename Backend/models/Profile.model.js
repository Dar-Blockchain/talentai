const mongoose = require("mongoose");
const TodoList = require("./todoList.model");
const PlanLimits = require("./PlanLimits.model");

// Sub-schemas for skills and softSkills to enable per-item timestamps
const skillSchema = new mongoose.Schema(
  {
    name: String,
    proficiencyLevel: Number,
    experienceLevel: String,
    NumberTestPassed: Number,
    ScoreTest: Number,
    Levelconfirmed: Number,
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
    Levelconfirmed: Number,
  },
  { timestamps: true }
);

const languageSchema = new mongoose.Schema(
  {
    language: String,
    proficiency: String, // Native, B2, B1, A2, A1, etc.
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
      enum: ["Candidate", "Company", "Employee"],
      required: true,
    },
    user_image: { type: String, required: false },
    resume: { type: String, required: false },

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
    spokenLanguages: [languageSchema],
    timeZone: { type: String, required: false },
    phone: { type: String, required: false },

    // ========== CONTACT INFORMATION ==========
    contactInformation: {
      email: { type: String, required: false, set: (value) => value ? value.toLowerCase() : value },
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
    isPublicProfile: { type: Boolean, default: false },

    // ========== REFERENCES & ASSOCIATIONS ==========
    todoList: { type: mongoose.Schema.Types.ObjectId, ref: "TodoList" },
    planLimits: { type: mongoose.Schema.Types.ObjectId, ref: "PlanLimits" },
    interviewDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SkillInterviewAssessment" },
    ],
    cvAnalyses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CVAnalysis" },
    ],

    // ========== COMPANY SPECIFIC FIELDS ==========
    companyDetails: {
      email: { type: String, set: (value) => value ? value.toLowerCase() : value },
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
    planUsage: {
      postsUsed: {
        type: Number,
        default: 0,
        description: "Current number of posts created",
      },
      monthlyInterviewsUsed: {
        type: Number,
        default: 0,
        description: "Current number of interviews used this month",
      },
      lastMonthlyResetDate: {
        type: Date,
        default: Date.now,
        description: "Last date when monthly interview count was reset",
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

    if ((doc.type === "Company" || doc.type === "Member") && !doc.planLimits) {
      // Get the Trial plan
      const trialPlan = await PlanLimits.findOne({ name: "Trial" });

      if (trialPlan) {
        await mongoose.model("Profile").findByIdAndUpdate(doc._id, {
          planLimits: trialPlan._id,
        });
        console.log(`✅ Trial plan assigned to ${doc.type.toLowerCase()} profile: ${doc._id}`);
      } else {
        console.warn(`⚠️  Trial plan not found. ${doc.type} profile ${doc._id} was not assigned a plan.`);
      }
    }
  } catch (error) {
    console.error("Error in Profile post-save hook:", error);
  }
});

// Index to speed up queries filtering by visibility
profileSchema.index({ isPublicProfile: 1 });

module.exports = mongoose.model("Profile", profileSchema);

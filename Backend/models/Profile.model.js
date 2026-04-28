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
    lastPlanReminderSentAt: { type: Date, default: null },
    planReminderCount: { type: Number, default: 0 },
    readyForMatch: { type: Boolean, default: false },
    isPublicProfile: { type: Boolean, default: false },

    // ========== REFERENCES & ASSOCIATIONS ==========
    todoList: { type: mongoose.Schema.Types.ObjectId, ref: "TodoList" },
    
    // ========== SUBSCRIPTION MANAGEMENT ==========
    activeSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      description: "Currently active subscription for the company",
    },
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        description: "Complete history of subscriptions",
      },
    ],
    
    // ========== DEPRECATED - KEPT FOR BACKWARD COMPATIBILITY ==========
    planLimits: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanLimits",
      description: "DEPRECATED: Use activeSubscription.planId instead. Kept for backward compatibility.",
    },
    
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        description: "Array of payment records associated with this profile",
      },
    ],
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
    // ========== CREATE TODOLIST FOR CANDIDATES ==========
    if (doc.type === "Candidate" && !doc.todoList) {
      const todoList = await TodoList.create({ profile: doc._id });

      await mongoose.model("Profile").findByIdAndUpdate(doc._id, {
        todoList: todoList._id,
      });
    }

    // ========== CREATE FREE SUBSCRIPTION FOR COMPANIES ==========
    if ((doc.type === "Company" || doc.type === "Member") && !doc.activeSubscription) {
      try {
        // Try Free plan first, fall back to Trial for backward compatibility
        const freePlan = await PlanLimits.findOne({ name: "Free", isActive: true })
          || await PlanLimits.findOne({ name: "Trial" });

        if (!freePlan) {
          console.warn(`⚠️  Free plan not found. ${doc.type} profile ${doc._id} was not assigned a plan.`);
          return;
        }

        const Subscription = mongoose.model("Subscription");
        const startDate = new Date();
        // Free plan never expires — set end date 100 years in the future
        const isFree = freePlan.name === "Free";
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + (isFree ? 100 : 0));
        if (!isFree) endDate.setDate(endDate.getDate() + (freePlan.durationDays || 30));

        const subscription = await Subscription.create({
          companyProfileId: doc._id,
          planId: freePlan._id,
          startDate,
          endDate,
          status: "active",
          autoRenew: false,
        });

        await mongoose.model("Profile").findByIdAndUpdate(
          doc._id,
          {
            activeSubscription: subscription._id,
            subscriptions: [subscription._id],
            planLimits: freePlan._id,
          },
          { runValidators: false }
        );

        console.log(`✅ Free subscription created for ${doc.type.toLowerCase()} profile: ${doc._id}`);
      } catch (subscriptionError) {
        console.error(`⚠️  Error creating free subscription: ${subscriptionError.message}`);
      }
    }
  } catch (error) {
    console.error("Error in Profile post-save hook:", error);
  }
});

// Index to speed up queries filtering by visibility
profileSchema.index({ isPublicProfile: 1 });
profileSchema.index({ userId: 1 });
profileSchema.index({ type: 1 });
profileSchema.index({ payments: 1 });

module.exports = mongoose.model("Profile", profileSchema);

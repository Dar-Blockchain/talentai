const mongoose = require("mongoose");
const TodoList = require("../models/todoListModel");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Candidate", "Company", "jury"],
      required: true,
    },
    user_image: { type: String, required: false, default: "client.png" },
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

    // Salary expectations
    expectedSalary: {
      min: { type: Number, required: false },
      max: { type: Number, required: false },
      currency: { type: String, required: false, default: "EUR" },
    },

    // Work preferences
    preferredContractType: { type: String, required: false },
    workModePreference: {
      type: String,
   //   enum: ["Remote", "Hybrid", "On-site"],
      required: false,
    },

    // Contact Information
    contactInformation: {
      email: { type: String, required: false },
      phone: { type: String, required: false },
      address: { type: String, required: false },
      linkedinUrl: { type: String, required: false },
      githubUrl: { type: String, required: false },
      personalWebsite: { type: String, required: false },
      location: { type: String, required: false },
    },
    // Quota for the user
    quota: { type: Number, default: 0 },
    quotaUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    // Ready for match
    readyForMatch: { type: Boolean, default: false },

   // overallScore: { type: Number, default: 0 },

    // Hard Skills
    skills: [
      {
        name: String,
        proficiencyLevel: Number,
        experienceLevel: String,
        NumberTestPassed: Number,
        ScoreTest: Number,
        Levelconfirmed: Number,
        isPrimary: Boolean,
      },
    ],

    // Soft Skills
    softSkills: [
      {
        name: String,
        category: String,
        proficiencyLevel: Number, // 0-5
        experienceLevel: String, // NoLevel , Entry Level..
        ScoreTest: Number,
        isPrimary: Boolean,
      },
    ],

    todoList: { type: mongoose.Schema.Types.ObjectId, ref: "TodoList" },
    //interviewDetails only for profile of type Candidate
    interviewDetails: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InterviewDetails" },
    ],

    // Company details (if type is Company)
    companyDetails: {
      email: String,
      name: String,
      industry: String,
      size: String,
      location: String,
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

    assessmentResults: [
      { type: mongoose.Schema.Types.ObjectId, ref: "JobAssessmentResult" },
    ],

    // projectAssessments removed (ProjectAssessment feature deprecated)

    // Bid received by user (if type is Candidate)
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

    // Users that this company has bid on (if type is Company)
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

module.exports = mongoose.model("Profile", profileSchema);

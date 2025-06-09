const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
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

    // Quota for the user
    quota: { type: Number, default: 0 },
    quotaUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    // Ready for match
    readyForMatch: { type: Boolean, default: false },

    overallScore: { type: Number, default: 0 },

    // Hard Skills
    skills: [
      {
        name: String,
        proficiencyLevel: Number,
        experienceLevel: String,
        NumberTestPassed: Number,
        ScoreTest: Number,
        Levelconfirmed : { type: Number, default: 0 }
      },
    ],

    // Soft Skills
    softSkills: [
      {
        name: String,
        category: String,
        experienceLevel: String,
        ScoreTest: Number,
      },
    ],

    todoList: { type: mongoose.Schema.Types.ObjectId, ref: "TodoList" },

    // Company details (if type is Company)
    companyDetails: {
      name: String,
      industry: String,
      size: String,
      location: String,
      /*employmentType: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site"],
        required: true,
      },*/
    },

    requiredSkills: [String],
    requiredExperienceLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior", "Lead/Expert"],
    },

    assessmentResults: [
      { type: mongoose.Schema.Types.ObjectId, ref: "JobAssessmentResult" },
    ],

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

module.exports = mongoose.model("Profile", profileSchema);

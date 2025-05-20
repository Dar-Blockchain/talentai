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
    overallScore: { type: Number, default: 0 },

    // Hard Skills
    skills: [
      {
        name: String,
        proficiencyLevel: Number,
        experienceLevel: String,
        NumberTestPassed: Number,
        ScoreTest: Number,
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

    // Company details (if type is Company)
    companyDetails: {
      name: String,
      industry: String,
      size: String,
      location: String,
    },

    requiredSkills: [String],
    requiredExperienceLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior", "Lead/Expert"],
    },

    // Bid received by user (if type is Candidate)
    companyBid: {
      finalBid: Number,
      dateBid : Date,
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

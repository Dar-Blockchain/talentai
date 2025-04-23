const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["Candidate", "Company"],
      required: true
    },
    overallScore : {type : Number, default : 0},
    skills: [
      {
        name: String,
        proficiencyLevel: Number,
        experienceLevel: String,
        NumberTestPassed: Number,
        ScoreTest: Number,
      },
    ],
    softSkills: [
      {
        name: String,
        category: String,
        experienceLevel: String,
        NumberTestPassed: Number,
        ScoreTest: Number,
      },
    ],
    companyDetails: {
      name: String,
      industry: String,
      size: String,
      location: String,
    },
    requiredSkills: [String],
    requiredExperienceLevel: {
      type: String,
      enum: ["Entry Level","Mid Level", "Senior", "Lead/Expert"],
      default: "Entry Level"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
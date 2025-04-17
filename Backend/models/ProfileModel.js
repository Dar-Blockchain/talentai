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
    skills: [
      {
        name: String,
        proficiencyLevel: Number,
        experienceLevel: String
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
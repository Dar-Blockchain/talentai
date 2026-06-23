const mongoose = require("mongoose");

const profileSkillSchema = new mongoose.Schema(
  {
    profile:          { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    name:             { type: String, required: true, trim: true },
    proficiencyLevel: { type: Number, default: 0 },
    experienceLevel:  { type: String, default: "" },
    numberTestPassed: { type: Number, default: 0 },
    testScore:        { type: Number, default: 0 },
    levelConfirmed:   { type: Number, default: 0 },
    // tracks which CVAnalysis documents sourced this skill — supports multi-CV
    sourceCvAnalyses: [{ type: mongoose.Schema.Types.ObjectId, ref: "CVAnalysis" }],
  },
  { timestamps: true }
);

// prevents duplicate skill names per profile at the DB level
profileSkillSchema.index({ profile: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("ProfileSkill", profileSkillSchema);

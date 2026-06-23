const mongoose = require("mongoose");

const profileSoftSkillSchema = new mongoose.Schema(
  {
    profile:          { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    name:             { type: String, required: true, trim: true },
    category:         { type: String, default: "" },
    proficiencyLevel: { type: Number, default: 0 },
    experienceLevel:  { type: String, default: "" },
    testScore:        { type: Number, default: 0 },
    levelConfirmed:   { type: Number, default: 0 },
    // tracks which CVAnalysis documents sourced this skill — supports multi-CV
    sourceCvAnalyses: [{ type: mongoose.Schema.Types.ObjectId, ref: "CVAnalysis" }],
  },
  { timestamps: true }
);

// prevents duplicate soft skill names per profile at the DB level
profileSoftSkillSchema.index({ profile: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("ProfileSoftSkill", profileSoftSkillSchema);

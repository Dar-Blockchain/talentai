const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const profileSkillSchema = new Schema(
  {
    profile:          { type: ObjectId, ref: "Profile", required: true, index: true },
    kind:             { type: String, enum: ["technical", "soft"], required: true },
    name:             { type: String, required: true, trim: true },
    category:         { type: String, default: "" },
    proficiencyLevel: { type: Number, default: 0 },
    experienceLevel:  { type: String, default: "" },
    numberTestPassed: { type: Number, default: 0 },
    testScore:        { type: Number, default: 0 },
    levelConfirmed:   { type: Number, default: 0 },
    sourceCvAnalyses: [{ type: ObjectId, ref: "CVAnalysis" }],
  },
  { timestamps: true }
);

profileSkillSchema.index({ profile: 1, kind: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("ProfileSkill", profileSkillSchema);

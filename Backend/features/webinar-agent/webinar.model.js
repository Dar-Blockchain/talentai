const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  key:       { type: String, required: true },   // e.g. "q1_role"
  label_fr:  { type: String, required: true },
  label_en:  { type: String, required: true },
  type:      { type: String, enum: ["choice", "scale", "text", "select"], default: "choice" },
  options:   [{ key: String, label_fr: String, label_en: String }],
  required:  { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
  ai_weight: { type: Number, default: 1 },       // scoring weight hint
}, { _id: false });

const WebinarSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  date:        { type: Date, default: null },
  status:      { type: String, enum: ["draft", "active", "archived"], default: "draft" },
  lang:        { type: String, enum: ["fr", "en", "both"], default: "fr" },

  // When true, AI generates/adjusts questions based on audience profile
  ai_enabled:  { type: Boolean, default: true },
  // AI prompt context (used to steer question generation)
  ai_context:  { type: String, default: "" },

  // "What is this webinar?" editorial text shown on the landing page
  about_fr:    { type: String, default: "" },
  about_en:    { type: String, default: "" },

  // External join link shown in emails (e.g. Zoom/Teams/Google Meet URL)
  webinar_link: { type: String, default: "" },

  // Up to 3 short benefit bullets shown on the landing page card
  highlights:  { type: [String], default: [] },

  questions:   [QuestionSchema],

  // Stats snapshot (updated on each completion)
  stats: {
    total_registrations: { type: Number, default: 0 },
    total_completions:   { type: Number, default: 0 },
    avg_maturite_ia:     { type: Number, default: null },
    tier_breakdown:      { type: Map, of: Number, default: {} },
  },

  created_by:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

module.exports = mongoose.models.Webinar || mongoose.model("Webinar", WebinarSchema);

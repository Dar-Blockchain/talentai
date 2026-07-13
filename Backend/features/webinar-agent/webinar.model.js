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
  // Primary/fallback copy — auto-derived from the *_fr/*_en fields below
  // based on `lang`, so existing consumers (admin list, cards, emails,
  // cron reminders) keep working without changes.
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  highlights:  { type: [String], default: [] },

  // Per-language variants — filled in from the admin form; both mirror
  // `title`/`description`/`highlights` when a webinar predates this field.
  title_fr:       { type: String, default: "" },
  title_en:       { type: String, default: "" },
  description_fr: { type: String, default: "" },
  description_en: { type: String, default: "" },
  highlights_fr:  { type: [String], default: [] },
  highlights_en:  { type: [String], default: [] },

  date:        { type: Date, default: null },
  status:      { type: String, enum: ["draft", "active"], default: "draft" },
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

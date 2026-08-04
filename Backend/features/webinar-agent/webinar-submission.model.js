const mongoose = require("mongoose");

const WebinarSubmissionSchema = new mongoose.Schema({
  webinar_id: { type: String, required: true, index: true },
  lang:       { type: String, enum: ["fr", "en", "both", "ar"], default: "fr" },
  consent:    { type: Boolean, default: false },

  contact: {
    nom:          { type: String, default: null },
    email:        { type: String, default: null, index: true, sparse: true },
    phone:        { type: String, default: null },
    entreprise:   { type: String, default: null },
    position:     { type: String, default: null },
    // Multi-select — a registrant can span more than one sector.
    sector: {
      type: [String],
      enum: ["technology", "finance", "healthcare", "retail", "manufacturing", "education", "telecom", "public_sector", "other"],
      default: [],
    },
    // Bucketed headcount, mirrors the qualification-grid ranges.
    hr_team_size: { type: String, enum: ["lt10", "10_50", "50_200", "gt200"], default: null },
    // Drives Dashboard 2's lead segment/script routing — set once at registration.
    profile_type: { type: String, enum: ["staffing_bpo", "enterprise_chro", "referrer"], default: null },
  },

  source: {
    utm_source:   { type: String, default: null },
    utm_campaign: { type: String, default: null },
    // Manually self-reported discovery channel (distinct from URL-based UTM tracking).
    channel: {
      type: String,
      enum: ["linkedin", "instagram", "facebook", "twitter_x", "google_search", "referral", "newsletter", "other"],
      default: null,
    },
  },

  answers: { type: mongoose.Schema.Types.Mixed, default: {} },

  // AI-maturity scoring: 4 sub-scores (/12 each, /48 total, /100 converted),
  // a maturity level, one strength + one vigilance point pulled straight from
  // the highest/lowest-scoring answered option, and organizer-only lead
  // qualification/routing derived from it.
  scoring: {
    subScores: {
      adoption:   { type: Number, default: 0 },
      governance: { type: Number, default: 0 },
      quality:    { type: Number, default: 0 },
      antifraud:  { type: Number, default: 0 },
    },
    total48:      { type: Number },
    total100:     { type: Number },
    maturityLevel: { type: String, enum: ["beginner", "explorer", "practitioner", "pioneer"] },
    strength: {
      questionLabel: { type: String, default: null },
      optionLabel:   { type: String, default: null },
      category:      { type: String, default: null },
    },
    vigilance: {
      questionLabel: { type: String, default: null },
      optionLabel:   { type: String, default: null },
      category:      { type: String, default: null },
    },
    qualification: {
      status:     { type: String, enum: ["hot", "warm", "cold"] },
      painSignal: { type: Boolean, default: false },
    },
    routing: {
      script:            { type: String, enum: ["v1", "v2", null], default: null },
      recommend1on1:      { type: Boolean, default: true },
      followUpTimeframe:  { type: String, default: null },
    },
    key_insight:        { type: String, default: null },
    main_pain:          { type: String, default: null },
    recommended_action: { type: String, default: null },
  },

  // Fan-out status for observability and replay
  synced: {
    notion:  { type: Boolean, default: false },
    sheets:  { type: Boolean, default: false },
    esp:     { type: Boolean, default: false },
  },

  completed: { type: Boolean, default: false },

  // Reminder tracking
  reminder_sent_at: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.WebinarSubmission
  || mongoose.model("WebinarSubmission", WebinarSubmissionSchema);

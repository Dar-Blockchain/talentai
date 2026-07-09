const mongoose = require("mongoose");

const WebinarSubmissionSchema = new mongoose.Schema({
  webinar_id: { type: String, required: true, index: true },
  lang:       { type: String, enum: ["fr", "en", "both", "ar"], default: "fr" },
  consent:    { type: Boolean, default: false },

  contact: {
    nom:        { type: String, default: null },
    email:      { type: String, default: null, index: true, sparse: true },
    entreprise: { type: String, default: null },
  },

  source: {
    utm_source:   { type: String, default: null },
    utm_campaign: { type: String, default: null },
  },

  answers: { type: mongoose.Schema.Types.Mixed, default: {} },

  scoring: {
    maturite_ia:        { type: Number },
    intensite_pain:     { type: Number },
    readiness_score:    { type: Number },
    icp_fit:            { type: String, enum: ["ok", "faible", "hors"] },
    these:              { type: String, enum: ["v1", "v2", "v3", "indetermine"] },
    tier:               { type: String, enum: ["A", "B", "C", "D"] },
    key_insight:        { type: String, default: null },
    main_pain:          { type: String, default: null },
    recommended_action: { type: String, default: null },
    strengths:          { type: [String], default: [] },
    blockers:           { type: [String], default: [] },
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

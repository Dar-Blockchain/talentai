const mongoose = require("mongoose");

// Nested as its own schema (not an inline object) to avoid Mongoose's
// special-casing of a `type` key inside a plain object literal, which
// would otherwise misinterpret the whole `source` field as `type: {...}`
// instead of a subdocument containing a `type` field.
const applicationSourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["linkedin", "facebook", "twitter", "instagram", "job_board", "company_website", "referral", "other", null],
      default: null,
    },
    detail: {
      type: String,
      default: null,
      description: "Free-text detail when type is 'other'",
    },
  },
  { _id: false },
);

const jobApplicationSchema = new mongoose.Schema(
  {
    // ========== REFERENCES ==========
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
      description: "Reference to candidate profile"
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
      description: "Reference to job post"
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      description: "Reference to company user who posted the job"
    },
    cvAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CVAnalysis",
      required: false,
      description: "Reference to CV analysis of the candidate"
    },

    // ========== APPLICATION DETAILS ==========
    status: {
      type: String,
      enum: ["visited", "interview_completed", "withdrawn"],
      default: "visited",
      index: true,
      description: "Current status of the application"
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      description: "Calculated match score between candidate and job"
    },
    matchReasoning: {
      type: String,
      default: null,
      description: "Detailed AI reasoning explaining how the match score was computed"
    },
    matchRecommendation: {
      type: String,
      default: null,
      description: "AI recommendation label: Top candidat | Recommandé | À considérer | Non retenu | Hors profil"
    },
    matchBreakdown: {
      type: [
        {
          key:      { type: String },
          label:    { type: String },
          maxScore: { type: Number },
          score:    { type: Number },
          note:     { type: String },
        }
      ],
      default: [],
      description: "Per-criterion breakdown of the AI match score"
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
      description: "Timestamp when application was submitted"
    },
    source: {
      type: applicationSourceSchema,
      default: () => ({}),
      description: "Where the candidate said they saw the job post link",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      description: "Last time application was updated"
    },
    viewedAt: {
      type: Date,
      default: null,
      description: "Timestamp when company viewed the application"
    },
    shortlistedAt: {
      type: Date,
      default: null,
      description: "Timestamp when candidate was shortlisted"
    },

    // ========== ASSESSMENT & INTERVIEW INFO ==========
    interviewAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostInterviewAssessment",
      required: false,
      description: "Reference to interview assessment if completed"
    },
    assessmentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      description: "Score from interview assessment"
    },

    // ========== REMINDER TRACKING ==========
    invitedAt: {
      type: Date,
      default: null,
    },
    firstInvitationSentAt: {
      type: Date,
      default: null,
      description: "Timestamp when automatic interview invitation was sent"
    },
    firstReminderSentAt: {
      type: Date,
      default: null,
      description: "Timestamp when 24h reminder was sent"
    },
    secondReminderSentAt: {
      type: Date,
      default: null,
      description: "Timestamp when 48h/expiration reminder was sent"
    },

    // ========== RECRUITER DECISION ==========
    recruiterDecision: {
      type: String,
      enum: ["shortlisted", "rejected", "not_matched", null],
      default: null,
      index: true,
      description: "Recruiter's decision on the candidate (shortlisted, manually rejected, auto not_matched due to low CV score, or pending)"
    },
    recruiterDecisionAt: {
      type: Date,
      default: null,
      description: "Timestamp when recruiter made the decision"
    },

    // ========== NOTES & FEEDBACK ==========
    companyNotes: {
      type: String,
      required: false,
      description: "Internal notes from company about the candidate"
    },
    rejectionReason: {
      type: String,
      required: false,
      description: "Reason for rejection if application was rejected"
    },

    // ========== WITHDRAWAL & ARCHIVAL ==========
    isWithdrawn: {
      type: Boolean,
      default: false,
      description: "Whether candidate withdrew the application"
    },
    withdrawnAt: {
      type: Date,
      default: null,
      description: "Timestamp when application was withdrawn"
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
      description: "Whether application is archived"
    },
  },
  {
    timestamps: true,
    collection: "job_applications"
  }
);

// Indexes for better query performance
jobApplicationSchema.index({ profile: 1, post: 1 }, { unique: true, description: "Ensure one application per candidate per post" });
jobApplicationSchema.index({ company: 1, post: 1 });
jobApplicationSchema.index({ company: 1, status: 1 });
jobApplicationSchema.index({ profile: 1, status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ matchScore: -1 });
jobApplicationSchema.index({ post: 1, status: 1 });

module.exports = mongoose.models.JobApplication || mongoose.model("JobApplication", jobApplicationSchema);
